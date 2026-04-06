from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, UploadFile, File
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import bcrypt
import jwt as pyjwt
import secrets
import requests as http_requests
import asyncio
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta

# Setup
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', secrets.token_hex(32))
JWT_ALGORITHM = "HS256"
ADMIN_SECRET_CODE = os.environ.get('ADMIN_SECRET_CODE', 'nexalign-admin-2024')
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')

# Object Storage
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
APP_NAME = "nexalign"
storage_key = None

def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    resp = http_requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_LLM_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key

def put_object(path, data, content_type):
    key = init_storage()
    resp = http_requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()

def get_object(path):
    key = init_storage()
    resp = http_requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# Password Hashing
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

# JWT Tokens
def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id, "email": email, "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
        "type": "access"
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh"
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=86400, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")

# Auth Helper
async def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"user_id": payload["sub"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user.pop("password_hash", None)
        return user
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Brute Force Protection
async def check_brute_force(ip, email):
    identifier = f"{ip}:{email}"
    attempt = await db.login_attempts.find_one({"identifier": identifier}, {"_id": 0})
    if attempt and attempt.get("count", 0) >= 5:
        lockout_until = attempt.get("lockout_until")
        if lockout_until:
            if isinstance(lockout_until, str):
                lockout_until = datetime.fromisoformat(lockout_until)
            if lockout_until.tzinfo is None:
                lockout_until = lockout_until.replace(tzinfo=timezone.utc)
            if datetime.now(timezone.utc) < lockout_until:
                raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")
            else:
                await db.login_attempts.delete_one({"identifier": identifier})

async def record_failed_attempt(ip, email):
    identifier = f"{ip}:{email}"
    attempt = await db.login_attempts.find_one({"identifier": identifier}, {"_id": 0})
    if attempt:
        new_count = attempt.get("count", 0) + 1
        update = {"$set": {"count": new_count}}
        if new_count >= 5:
            update["$set"]["lockout_until"] = (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()
        await db.login_attempts.update_one({"identifier": identifier}, update)
    else:
        await db.login_attempts.insert_one({"identifier": identifier, "count": 1, "created_at": datetime.now(timezone.utc).isoformat()})

async def clear_failed_attempts(ip, email):
    await db.login_attempts.delete_one({"identifier": f"{ip}:{email}"})

# App Setup
app = FastAPI()
api_router = APIRouter(prefix="/api")

@api_router.get("/")
async def health():
    return {"status": "ok", "app": "Nexalign API"}

# ==================== PYDANTIC MODELS ====================

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AdminRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    secret_code: str

class GoogleCallbackRequest(BaseModel):
    credential: str
    role: Optional[str] = "student"

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    behance_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    skills: Optional[List[str]] = None
    bio: Optional[str] = None
    company_name: Optional[str] = None
    company_website: Optional[str] = None
    office_address: Optional[str] = None
    company_linkedin: Optional[str] = None
    company_description: Optional[str] = None

class CreateInternshipRequest(BaseModel):
    title: str
    description: str
    requirements: List[str] = []
    skills_required: List[str] = []
    duration: str
    stipend: Optional[str] = None
    location: str
    type: str
    openings: int = 1

class CreateApplicationRequest(BaseModel):
    internship_id: str
    cover_letter: Optional[str] = None

class UpdateApplicationStatusRequest(BaseModel):
    status: str

class CreateWeeklyLogRequest(BaseModel):
    internship_id: str
    application_id: str
    week_number: int
    tasks_completed: str
    challenges: Optional[str] = None
    next_week_plan: Optional[str] = None

class ChatbotRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class VerifyCompanyRequest(BaseModel):
    status: str
    notes: Optional[str] = None

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/register")
async def register(req: RegisterRequest, response: Response):
    email = req.email.lower()
    if req.role not in ["student", "company"]:
        raise HTTPException(status_code=400, detail="Role must be 'student' or 'company'")
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = {
        "user_id": user_id, "email": email, "name": req.name,
        "password_hash": hash_password(req.password), "role": req.role,
        "auth_provider": "local", "linkedin_url": "", "github_url": "",
        "behance_url": "", "portfolio_url": "", "skills": [], "bio": "",
        "resume_path": "", "resume_filename": "", "profile_completed": False,
        "picture": "", "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    if req.role == "company":
        user_doc.update({
            "company_name": "", "company_website": "", "office_address": "",
            "company_linkedin": "", "company_description": "",
            "verification_status": "pending", "verification_notes": "",
        })
    await db.users.insert_one(user_doc)
    user_doc.pop("_id", None)
    user_doc.pop("password_hash", None)
    access_token = create_access_token(user_id, email, req.role)
    refresh_token = create_refresh_token(user_id)
    set_auth_cookies(response, access_token, refresh_token)
    return {"user": user_doc, "access_token": access_token}

@api_router.post("/auth/login")
async def login(req: LoginRequest, request: Request, response: Response):
    email = req.email.lower()
    ip = request.client.host if request.client else "unknown"
    await check_brute_force(ip, email)
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        await record_failed_attempt(ip, email)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.get("password_hash"):
        raise HTTPException(status_code=400, detail="This account uses Google sign-in")
    if not verify_password(req.password, user["password_hash"]):
        await record_failed_attempt(ip, email)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await clear_failed_attempts(ip, email)
    access_token = create_access_token(user["user_id"], email, user["role"])
    refresh_token = create_refresh_token(user["user_id"])
    set_auth_cookies(response, access_token, refresh_token)
    user.pop("password_hash", None)
    return {"user": user, "access_token": access_token}

@api_router.post("/auth/admin-register")
async def admin_register(req: AdminRegisterRequest, response: Response):
    if req.secret_code != ADMIN_SECRET_CODE:
        raise HTTPException(status_code=403, detail="Invalid admin secret code")
    email = req.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = {
        "user_id": user_id, "email": email, "name": req.name,
        "password_hash": hash_password(req.password), "role": "admin",
        "auth_provider": "local",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user_doc)
    user_doc.pop("_id", None)
    user_doc.pop("password_hash", None)
    access_token = create_access_token(user_id, email, "admin")
    refresh_token = create_refresh_token(user_id)
    set_auth_cookies(response, access_token, refresh_token)
    return {"user": user_doc, "access_token": access_token}

@api_router.post("/auth/google-callback")
async def google_callback(req: GoogleCallbackRequest, response: Response):
    try:
        # Verify the Google ID token using google-auth library
        idinfo = id_token.verify_oauth2_token(
            req.credential, google_requests.Request(), GOOGLE_CLIENT_ID
        )
        if idinfo["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
            raise ValueError("Invalid issuer")
    except Exception as e:
        logger.error(f"Google OAuth token verification failed: {e}")
        raise HTTPException(status_code=400, detail="Invalid Google token")
    email = idinfo["email"].lower()
    name = idinfo.get("name", "")
    picture = idinfo.get("picture", "")
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user = existing
        await db.users.update_one(
            {"email": email},
            {"$set": {"picture": picture, "name": name or existing.get("name", ""), "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        user["picture"] = picture
        user["name"] = name or user.get("name", "")
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        role = req.role if req.role in ["student", "company"] else "student"
        user = {
            "user_id": user_id, "email": email, "name": name,
            "password_hash": "", "role": role, "auth_provider": "google",
            "linkedin_url": "", "github_url": "", "behance_url": "",
            "portfolio_url": "", "skills": [], "bio": "",
            "resume_path": "", "resume_filename": "", "profile_completed": False,
            "picture": picture,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        if role == "company":
            user.update({
                "company_name": "", "company_website": "", "office_address": "",
                "company_linkedin": "", "company_description": "",
                "verification_status": "pending", "verification_notes": "",
            })
        await db.users.insert_one(user)
        user.pop("_id", None)
    user.pop("_id", None)
    user.pop("password_hash", None)
    access_token = create_access_token(user["user_id"], email, user["role"])
    refresh_token = create_refresh_token(user["user_id"])
    set_auth_cookies(response, access_token, refresh_token)
    return {"user": user, "access_token": access_token}

@api_router.get("/auth/me")
async def get_me(request: Request):
    return await get_current_user(request)

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}

@api_router.post("/auth/refresh")
async def refresh_token_endpoint(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"user_id": payload["sub"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        access_token = create_access_token(user["user_id"], user["email"], user["role"])
        response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=86400, path="/")
        return {"access_token": access_token}
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

# ==================== PROFILE ENDPOINTS ====================

@api_router.put("/profile")
async def update_profile(req: UpdateProfileRequest, request: Request):
    user = await get_current_user(request)
    update_data = {k: v for k, v in req.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    current = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0})
    merged = {**current, **update_data}
    if user["role"] == "student":
        if merged.get("linkedin_url") and merged.get("name"):
            update_data["profile_completed"] = True
    elif user["role"] == "company":
        if merged.get("company_name") and merged.get("company_linkedin") and merged.get("office_address"):
            update_data["profile_completed"] = True
    await db.users.update_one({"user_id": user["user_id"]}, {"$set": update_data})
    updated = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0})
    updated.pop("password_hash", None)
    return updated

@api_router.get("/profile/{user_id}")
async def get_profile(user_id: str):
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.pop("password_hash", None)
    return user

# ==================== INTERNSHIP ENDPOINTS ====================

@api_router.post("/internships")
async def create_internship(req: CreateInternshipRequest, request: Request):
    user = await get_current_user(request)
    if user["role"] != "company":
        raise HTTPException(status_code=403, detail="Only companies can post internships")
    if user.get("verification_status") != "verified":
        raise HTTPException(status_code=403, detail="Company must be verified to post internships")
    internship_id = f"intern_{uuid.uuid4().hex[:12]}"
    internship = {
        "internship_id": internship_id,
        "company_user_id": user["user_id"],
        "company_name": user.get("company_name", user.get("name", "")),
        "title": req.title, "description": req.description,
        "requirements": req.requirements, "skills_required": req.skills_required,
        "duration": req.duration, "stipend": req.stipend,
        "location": req.location, "type": req.type,
        "openings": req.openings, "applications_count": 0,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.internships.insert_one(internship)
    internship.pop("_id", None)
    return internship

@api_router.get("/internships")
async def list_internships(
    skip: int = 0, limit: int = 20,
    skill: Optional[str] = None, location: Optional[str] = None,
    type: Optional[str] = None, search: Optional[str] = None
):
    query = {"status": "active"}
    if skill:
        query["skills_required"] = {"$in": [skill]}
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    if type:
        query["type"] = type
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"company_name": {"$regex": search, "$options": "i"}},
        ]
    internships = await db.internships.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.internships.count_documents(query)
    return {"internships": internships, "total": total}

@api_router.get("/internships/{internship_id}")
async def get_internship(internship_id: str):
    internship = await db.internships.find_one({"internship_id": internship_id}, {"_id": 0})
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")
    return internship

@api_router.put("/internships/{internship_id}")
async def update_internship(internship_id: str, req: CreateInternshipRequest, request: Request):
    user = await get_current_user(request)
    internship = await db.internships.find_one({"internship_id": internship_id}, {"_id": 0})
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")
    if internship["company_user_id"] != user["user_id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    update_data = req.model_dump()
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.internships.update_one({"internship_id": internship_id}, {"$set": update_data})
    updated = await db.internships.find_one({"internship_id": internship_id}, {"_id": 0})
    return updated

@api_router.delete("/internships/{internship_id}")
async def delete_internship(internship_id: str, request: Request):
    user = await get_current_user(request)
    internship = await db.internships.find_one({"internship_id": internship_id}, {"_id": 0})
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")
    if internship["company_user_id"] != user["user_id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    await db.internships.update_one({"internship_id": internship_id}, {"$set": {"status": "closed"}})
    return {"message": "Internship closed"}

# ==================== APPLICATION ENDPOINTS ====================

@api_router.post("/applications")
async def create_application(req: CreateApplicationRequest, request: Request):
    user = await get_current_user(request)
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Only students can apply")
    internship = await db.internships.find_one({"internship_id": req.internship_id}, {"_id": 0})
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")
    existing = await db.applications.find_one({"student_user_id": user["user_id"], "internship_id": req.internship_id})
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this internship")
    application_id = f"app_{uuid.uuid4().hex[:12]}"
    application = {
        "application_id": application_id, "internship_id": req.internship_id,
        "internship_title": internship.get("title", ""),
        "company_name": internship.get("company_name", ""),
        "student_user_id": user["user_id"],
        "student_name": user.get("name", ""), "student_email": user.get("email", ""),
        "cover_letter": req.cover_letter or "", "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.applications.insert_one(application)
    application.pop("_id", None)
    await db.internships.update_one({"internship_id": req.internship_id}, {"$inc": {"applications_count": 1}})
    return application

@api_router.get("/applications")
async def list_applications(request: Request, internship_id: Optional[str] = None):
    user = await get_current_user(request)
    query = {}
    if user["role"] == "student":
        query["student_user_id"] = user["user_id"]
    elif user["role"] == "company":
        company_internships = await db.internships.find(
            {"company_user_id": user["user_id"]}, {"internship_id": 1, "_id": 0}
        ).to_list(1000)
        internship_ids = [i["internship_id"] for i in company_internships]
        query["internship_id"] = {"$in": internship_ids}
    if internship_id:
        query["internship_id"] = internship_id
    applications = await db.applications.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return {"applications": applications}

@api_router.put("/applications/{application_id}/status")
async def update_application_status(application_id: str, req: UpdateApplicationStatusRequest, request: Request):
    user = await get_current_user(request)
    if user["role"] not in ["company", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    application = await db.applications.find_one({"application_id": application_id}, {"_id": 0})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    if user["role"] == "company":
        internship = await db.internships.find_one({"internship_id": application["internship_id"]}, {"_id": 0})
        if not internship or internship["company_user_id"] != user["user_id"]:
            raise HTTPException(status_code=403, detail="Not authorized")
    await db.applications.update_one(
        {"application_id": application_id},
        {"$set": {"status": req.status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Status updated", "status": req.status}

# ==================== WEEKLY LOG ENDPOINTS ====================

@api_router.post("/logs")
async def create_weekly_log(req: CreateWeeklyLogRequest, request: Request):
    user = await get_current_user(request)
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Only students can submit logs")
    log_id = f"log_{uuid.uuid4().hex[:12]}"
    log_doc = {
        "log_id": log_id, "internship_id": req.internship_id,
        "application_id": req.application_id, "student_user_id": user["user_id"],
        "student_name": user.get("name", ""), "week_number": req.week_number,
        "tasks_completed": req.tasks_completed,
        "challenges": req.challenges or "", "next_week_plan": req.next_week_plan or "",
        "feedback": "", "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.weekly_logs.insert_one(log_doc)
    log_doc.pop("_id", None)
    return log_doc

@api_router.get("/logs/{internship_id}")
async def get_weekly_logs(internship_id: str, request: Request):
    await get_current_user(request)
    logs = await db.weekly_logs.find({"internship_id": internship_id}, {"_id": 0}).sort("week_number", 1).to_list(100)
    return {"logs": logs}

# ==================== ADMIN ENDPOINTS ====================

async def require_admin(request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

@api_router.get("/admin/stats")
async def admin_stats(request: Request):
    await require_admin(request)
    return {
        "total_students": await db.users.count_documents({"role": "student"}),
        "total_companies": await db.users.count_documents({"role": "company"}),
        "pending_companies": await db.users.count_documents({"role": "company", "verification_status": "pending"}),
        "verified_companies": await db.users.count_documents({"role": "company", "verification_status": "verified"}),
        "total_internships": await db.internships.count_documents({}),
        "active_internships": await db.internships.count_documents({"status": "active"}),
        "total_applications": await db.applications.count_documents({}),
    }

@api_router.get("/admin/users")
async def admin_list_users(request: Request, role: Optional[str] = None):
    await require_admin(request)
    query = {}
    if role:
        query["role"] = role
    users = await db.users.find(query, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(1000)
    return {"users": users}

@api_router.get("/admin/companies")
async def admin_list_companies(request: Request, status: Optional[str] = None):
    await require_admin(request)
    query = {"role": "company"}
    if status:
        query["verification_status"] = status
    companies = await db.users.find(query, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(1000)
    return {"companies": companies}

@api_router.put("/admin/companies/{user_id}/verify")
async def admin_verify_company(user_id: str, req: VerifyCompanyRequest, request: Request):
    await require_admin(request)
    company = await db.users.find_one({"user_id": user_id, "role": "company"})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"verification_status": req.status, "verification_notes": req.notes or "", "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": f"Company {req.status}", "user_id": user_id}

@api_router.get("/admin/applications")
async def admin_list_applications(request: Request):
    await require_admin(request)
    applications = await db.applications.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return {"applications": applications}

# ==================== UPLOAD ENDPOINTS ====================

@api_router.post("/upload/resume")
async def upload_resume(request: Request, file: UploadFile = File(...)):
    user = await get_current_user(request)
    allowed_types = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only PDF and DOC files are allowed")
    ext = file.filename.split(".")[-1] if "." in file.filename else "pdf"
    storage_path = f"{APP_NAME}/resumes/{user['user_id']}/{uuid.uuid4()}.{ext}"
    data = await file.read()
    try:
        result = put_object(storage_path, data, file.content_type or "application/pdf")
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload file")
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"resume_path": result["path"], "resume_filename": file.filename, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    await db.files.insert_one({
        "file_id": str(uuid.uuid4()), "user_id": user["user_id"],
        "storage_path": result["path"], "original_filename": file.filename,
        "content_type": file.content_type, "size": result.get("size", 0),
        "is_deleted": False, "created_at": datetime.now(timezone.utc).isoformat()
    })
    return {"path": result["path"], "filename": file.filename}

@api_router.get("/files/{path:path}")
async def download_file(path: str, request: Request):
    await get_current_user(request)
    record = await db.files.find_one({"storage_path": path, "is_deleted": False}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    try:
        data, content_type = get_object(path)
    except Exception as e:
        logger.error(f"Download error: {e}")
        raise HTTPException(status_code=500, detail="Failed to download file")
    return Response(content=data, media_type=record.get("content_type", content_type))

# ==================== CHATBOT ENDPOINT ====================

@api_router.post("/chatbot")
async def chatbot(req: ChatbotRequest, request: Request):
    try:
        user = await get_current_user(request)
        user_context = f"User: {user.get('name', 'Guest')}, Role: {user.get('role', 'visitor')}"
    except Exception:
        user_context = "User: Guest visitor"
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        session_id = req.session_id or str(uuid.uuid4())
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"nexalign-{session_id}",
            system_message=f"""You are NexBot, the AI assistant for Nexalign - the only internship platform where every company is verified before posting. Built exclusively for DBS Dehradun students.
You help with: navigating the platform, applying for internships, company verification process, weekly log system, profile creation, and general career advice.
{user_context}
Keep responses concise, friendly, and helpful. For technical issues, direct to support@nexalign.com."""
        ).with_model("openai", "gpt-4o-mini")
        user_message = UserMessage(text=req.message)
        bot_response = await chat.send_message(user_message)
        await db.chat_messages.insert_one({
            "session_id": session_id, "user_message": req.message,
            "bot_response": bot_response, "created_at": datetime.now(timezone.utc).isoformat()
        })
        return {"response": bot_response, "session_id": session_id}
    except Exception as e:
        logger.error(f"Chatbot error: {e}")
        return {"response": "I'm having trouble right now. Please try again or contact support@nexalign.com.", "session_id": req.session_id or str(uuid.uuid4())}

# ==================== STARTUP & CONFIG ====================

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("user_id", unique=True)
    await db.internships.create_index("internship_id", unique=True)
    await db.applications.create_index("application_id", unique=True)
    await db.login_attempts.create_index("identifier")
    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@nexalign.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "NexAdmin@2024")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "user_id": f"user_{uuid.uuid4().hex[:12]}", "email": admin_email,
            "name": "Nexalign Admin", "password_hash": hash_password(admin_password),
            "role": "admin", "auth_provider": "local",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Admin seeded: {admin_email}")
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
    # Init storage
    try:
        init_storage()
        logger.info("Object storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed (non-critical): {e}")
    # Write test credentials
    os.makedirs("/app./memory", exist_ok=True)
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write(f"# Nexalign Test Credentials\n\n## Admin\n- Email: {admin_email}\n- Password: {admin_password}\n- Role: admin\n\n")
        f.write(f"## Admin Secret Code\n- Code: {ADMIN_SECRET_CODE}\n\n")
        f.write("## Endpoints\n- POST /api/auth/register\n- POST /api/auth/login\n- POST /api/auth/admin-register\n")
        f.write("- POST /api/auth/google-callback\n- GET /api/auth/me\n- POST /api/auth/logout\n- POST /api/auth/refresh\n")

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000"), "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
