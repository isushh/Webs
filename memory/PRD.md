# Nexalign - Internship Platform PRD

## Original Problem Statement
Create an internship platform with 3D animated hero section where students and companies can log in to apply or post internships. Dark theme with cyan/green, glass effects, animations. Complete backend + database. LinkedIn required for profiles. Admin panel with company verification. AI chatbot, resume upload, weekly logs. DBS Dehradun exclusive.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn UI + Framer Motion
- **Backend**: FastAPI + MongoDB (Motor async driver)
- **Auth**: JWT (email/password) + Emergent Google OAuth
- **AI**: OpenAI GPT-4o-mini via emergentintegrations (chatbot)
- **Storage**: Emergent Object Storage (resume uploads)
- **Email**: Resend (configured but needs API key)

## User Personas
1. **Students** (DBS Dehradun): Register, create profile, browse/apply for internships, submit weekly logs
2. **Companies**: Register, get verified, post skill-based internships, manage applications
3. **Admins**: Verify companies, view all users/applications/stats

## Core Requirements
- [x] 3D animated hero section (canvas particle network)
- [x] Dark theme with cyan/green accents, glass effects
- [x] JWT + Google OAuth dual authentication
- [x] Student registration (3-step: account, profile with LinkedIn required, skills + resume)
- [x] Company registration (2-step: account, company details)
- [x] Admin registration with secret code
- [x] Admin dashboard (stats, company verification, user management)
- [x] Internship CRUD (skill-based, company-only)
- [x] Application system (student applies, company manages)
- [x] Weekly progress logs
- [x] Resume upload to object storage
- [x] AI chatbot (NexBot)
- [x] Browse internships with search/filter
- [x] Profile viewing (admin can view all profiles)
- [x] Company verification workflow
- [x] Brute force protection on login
- [x] Responsive design with animations

## What's Been Implemented (April 6, 2026)
- Full backend API with 20+ endpoints
- 10 frontend pages with glassmorphism design
- 3D particle animation hero section
- Complete auth system (JWT + Google OAuth)
- All CRUD operations for internships, applications, logs
- Admin dashboard with company verification
- AI chatbot widget
- Resume upload functionality
- Responsive navigation with glass effects

## Prioritized Backlog
### P0 (Critical)
- None remaining

### P1 (Important)
- Email notifications (Resend API key needed from user)
- Resume parsing with AI (extract skills from uploaded resumes)
- Password reset flow (backend endpoints exist)

### P2 (Nice to Have)
- Email verification on registration
- Internship recommendation engine
- Advanced search filters (salary range, duration, etc.)
- Profile completion percentage indicator
- Company analytics dashboard
- Export applications to CSV

## Next Tasks
1. User to provide Resend API key for email notifications
2. Implement resume parsing when user uploads resume
3. Add password reset UI flow
4. Add internship recommendation based on student skills
