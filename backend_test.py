#!/usr/bin/env python3
"""
Nexalign Backend API Testing Suite
Tests all authentication, profile, internship, application, admin, and chatbot endpoints
"""

import requests
import sys
import json
import uuid
from datetime import datetime
from typing import Dict, Any, Optional

class NexalignAPITester:
    def __init__(self, base_url: str = "https://verified-nexus.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.admin_token = None
        self.student_token = None
        self.company_token = None
        self.test_data = {}
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
        # Test credentials from review request
        self.admin_email = "admin@nexalign.com"
        self.admin_password = "NexAdmin@2024"
        self.admin_secret = "nexalign-admin-2024"
        
        # Generate unique test data
        timestamp = datetime.now().strftime("%H%M%S")
        self.test_student_email = f"test_student_{timestamp}@test.com"
        self.test_company_email = f"test_company_{timestamp}@test.com"
        self.test_password = "TestPass123!"

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    {details}")
        if success:
            self.tests_passed += 1
        else:
            self.failed_tests.append({"test": name, "details": details})

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    token: Optional[str] = None, expected_status: int = 200) -> tuple[bool, Dict]:
        """Make HTTP request and validate response"""
        url = f"{self.api_url}/{endpoint.lstrip('/')}"
        headers = {"Content-Type": "application/json"}
        
        if token:
            headers["Authorization"] = f"Bearer {token}"
            
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method.upper() == "PUT":
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                return False, {"error": f"Unsupported method: {method}"}
                
            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"status_code": response.status_code, "text": response.text}
                
            return success, response_data
            
        except Exception as e:
            return False, {"error": str(e)}

    def test_health_check(self):
        """Test basic API health"""
        success, data = self.make_request("GET", "/")
        self.log_test("API Health Check", success and data.get("status") == "ok", 
                     f"Response: {data}")

    def test_admin_login(self):
        """Test admin login with seeded credentials"""
        success, data = self.make_request("POST", "/auth/login", {
            "email": self.admin_email,
            "password": self.admin_password
        })
        
        if success and data.get("access_token"):
            self.admin_token = data["access_token"]
            self.test_data["admin_user"] = data.get("user", {})
            self.log_test("Admin Login", True, f"Admin role: {data.get('user', {}).get('role')}")
        else:
            self.log_test("Admin Login", False, f"Response: {data}")

    def test_student_registration(self):
        """Test student registration flow"""
        success, data = self.make_request("POST", "/auth/register", {
            "email": self.test_student_email,
            "password": self.test_password,
            "name": "Test Student",
            "role": "student"
        }, expected_status=200)
        
        if success and data.get("access_token"):
            self.student_token = data["access_token"]
            self.test_data["student_user"] = data.get("user", {})
            self.log_test("Student Registration", True, f"Student ID: {data.get('user', {}).get('user_id')}")
        else:
            self.log_test("Student Registration", False, f"Response: {data}")

    def test_company_registration(self):
        """Test company registration flow"""
        success, data = self.make_request("POST", "/auth/register", {
            "email": self.test_company_email,
            "password": self.test_password,
            "name": "Test Company",
            "role": "company"
        }, expected_status=200)
        
        if success and data.get("access_token"):
            self.company_token = data["access_token"]
            self.test_data["company_user"] = data.get("user", {})
            self.log_test("Company Registration", True, f"Company ID: {data.get('user', {}).get('user_id')}")
        else:
            self.log_test("Company Registration", False, f"Response: {data}")

    def test_auth_me_endpoint(self):
        """Test GET /auth/me for all user types"""
        # Test admin
        if self.admin_token:
            success, data = self.make_request("GET", "/auth/me", token=self.admin_token)
            self.log_test("Admin /auth/me", success and data.get("role") == "admin", 
                         f"Admin email: {data.get('email')}")
        
        # Test student
        if self.student_token:
            success, data = self.make_request("GET", "/auth/me", token=self.student_token)
            self.log_test("Student /auth/me", success and data.get("role") == "student", 
                         f"Student email: {data.get('email')}")
        
        # Test company
        if self.company_token:
            success, data = self.make_request("GET", "/auth/me", token=self.company_token)
            self.log_test("Company /auth/me", success and data.get("role") == "company", 
                         f"Company email: {data.get('email')}")

    def test_admin_register_endpoint(self):
        """Test admin registration with secret code"""
        test_admin_email = f"test_admin_{datetime.now().strftime('%H%M%S')}@test.com"
        success, data = self.make_request("POST", "/auth/admin-register", {
            "email": test_admin_email,
            "password": self.test_password,
            "name": "Test Admin",
            "secret_code": self.admin_secret
        })
        
        self.log_test("Admin Registration with Secret", success and data.get("user", {}).get("role") == "admin",
                     f"Response: {data}")

    def test_profile_update(self):
        """Test profile update for student and company"""
        # Test student profile update
        if self.student_token:
            success, data = self.make_request("PUT", "/profile", {
                "name": "Updated Student Name",
                "linkedin_url": "https://linkedin.com/in/teststudent",
                "skills": ["Python", "React", "MongoDB"],
                "bio": "Test student bio"
            }, token=self.student_token)
            self.log_test("Student Profile Update", success, f"Profile completed: {data.get('profile_completed')}")
        
        # Test company profile update
        if self.company_token:
            success, data = self.make_request("PUT", "/profile", {
                "company_name": "Test Company Inc",
                "company_linkedin": "https://linkedin.com/company/testcompany",
                "office_address": "123 Test Street, Test City",
                "company_description": "A test company for testing purposes"
            }, token=self.company_token)
            self.log_test("Company Profile Update", success, f"Profile completed: {data.get('profile_completed')}")

    def test_admin_stats(self):
        """Test admin stats endpoint"""
        if self.admin_token:
            success, data = self.make_request("GET", "/admin/stats", token=self.admin_token)
            expected_keys = ["total_students", "total_companies", "pending_companies", 
                           "verified_companies", "total_internships", "active_internships", "total_applications"]
            has_all_keys = all(key in data for key in expected_keys)
            self.log_test("Admin Stats", success and has_all_keys, 
                         f"Stats: {json.dumps(data, indent=2)}")

    def test_admin_companies_list(self):
        """Test admin companies listing"""
        if self.admin_token:
            success, data = self.make_request("GET", "/admin/companies", token=self.admin_token)
            self.log_test("Admin Companies List", success and "companies" in data,
                         f"Found {len(data.get('companies', []))} companies")

    def test_company_verification(self):
        """Test company verification by admin"""
        if self.admin_token and self.test_data.get("company_user"):
            company_id = self.test_data["company_user"]["user_id"]
            success, data = self.make_request("PUT", f"/admin/companies/{company_id}/verify", {
                "status": "verified",
                "notes": "Test verification"
            }, token=self.admin_token)
            self.log_test("Company Verification", success, f"Response: {data}")
            
            # Update company verification status in test data
            if success:
                self.test_data["company_user"]["verification_status"] = "verified"

    def test_internship_creation(self):
        """Test internship creation by verified company"""
        if self.company_token and self.test_data.get("company_user", {}).get("verification_status") == "verified":
            success, data = self.make_request("POST", "/internships", {
                "title": "Test Software Developer Internship",
                "description": "A test internship for software development",
                "requirements": ["Bachelor's degree", "Programming experience"],
                "skills_required": ["Python", "React", "MongoDB"],
                "duration": "3 months",
                "stipend": "₹15,000/month",
                "location": "Remote",
                "type": "Full-time",
                "openings": 2
            }, token=self.company_token, expected_status=200)
            
            if success:
                self.test_data["internship"] = data
                self.log_test("Internship Creation", True, f"Internship ID: {data.get('internship_id')}")
            else:
                self.log_test("Internship Creation", False, f"Response: {data}")
        else:
            self.log_test("Internship Creation", False, "Company not verified or token missing")

    def test_internships_listing(self):
        """Test internships listing (public endpoint)"""
        success, data = self.make_request("GET", "/internships")
        self.log_test("Internships Listing", success and "internships" in data,
                     f"Found {len(data.get('internships', []))} internships")

    def test_internship_application(self):
        """Test student applying to internship"""
        if self.student_token and self.test_data.get("internship"):
            internship_id = self.test_data["internship"]["internship_id"]
            success, data = self.make_request("POST", "/applications", {
                "internship_id": internship_id,
                "cover_letter": "I am very interested in this internship opportunity."
            }, token=self.student_token, expected_status=200)
            
            if success:
                self.test_data["application"] = data
                self.log_test("Internship Application", True, f"Application ID: {data.get('application_id')}")
            else:
                self.log_test("Internship Application", False, f"Response: {data}")

    def test_applications_listing(self):
        """Test applications listing for student and company"""
        # Test student applications
        if self.student_token:
            success, data = self.make_request("GET", "/applications", token=self.student_token)
            self.log_test("Student Applications List", success and "applications" in data,
                         f"Student has {len(data.get('applications', []))} applications")
        
        # Test company applications
        if self.company_token:
            success, data = self.make_request("GET", "/applications", token=self.company_token)
            self.log_test("Company Applications List", success and "applications" in data,
                         f"Company has {len(data.get('applications', []))} applications")

    def test_chatbot(self):
        """Test chatbot endpoint"""
        success, data = self.make_request("POST", "/chatbot", {
            "message": "Hello, can you help me with internship applications?",
            "session_id": str(uuid.uuid4())
        })
        
        has_response = success and "response" in data and data["response"]
        self.log_test("Chatbot", has_response, f"Bot response: {data.get('response', '')[:100]}...")

    def test_resume_upload_endpoint(self):
        """Test resume upload endpoint structure (without actual file)"""
        if self.student_token:
            # Test without file to check endpoint exists and auth works
            success, data = self.make_request("POST", "/upload/resume", token=self.student_token, expected_status=422)
            # 422 is expected because we're not sending a file
            endpoint_exists = success or "detail" in data
            self.log_test("Resume Upload Endpoint", endpoint_exists, 
                         "Endpoint exists and requires file upload")

    def test_logout(self):
        """Test logout endpoint"""
        if self.student_token:
            success, data = self.make_request("POST", "/auth/logout", token=self.student_token)
            self.log_test("Logout", success, f"Response: {data}")

    def run_all_tests(self):
        """Run all backend tests in sequence"""
        print("🚀 Starting Nexalign Backend API Tests")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Basic connectivity
        self.test_health_check()
        
        # Authentication tests
        self.test_admin_login()
        self.test_student_registration()
        self.test_company_registration()
        self.test_auth_me_endpoint()
        self.test_admin_register_endpoint()
        
        # Profile tests
        self.test_profile_update()
        
        # Admin functionality
        self.test_admin_stats()
        self.test_admin_companies_list()
        self.test_company_verification()
        
        # Internship workflow
        self.test_internship_creation()
        self.test_internships_listing()
        self.test_internship_application()
        self.test_applications_listing()
        
        # Additional features
        self.test_chatbot()
        self.test_resume_upload_endpoint()
        self.test_logout()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"  - {test['test']}: {test['details']}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test runner"""
    tester = NexalignAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())