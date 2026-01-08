---
id: 1
title: update-constitution-for-todo-app
stage: constitution
date: 2025-12-31
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: 1-ai-robotics-textbook
user: star con
command: sp.constitution
labels: [constitution, spec-kit-plus, todo-app]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
---

## Prompt

Project: Phase II – Todo Full-Stack Web Application (Spec-Kit Plus Monorepo)

Objective:
Transform the existing console-based Todo application into a secure, multi-user, full-stack web application using a strict spec-driven and agentic development workflow. All development must be performed through Claude Code agents using Spec-Kit Plus. No manual coding by the human is permitted.

Development Methodology:
- Follow the Agentic Dev Stack workflow strictly:
  Write Spec → Generate Plan → Break into Tasks → Implement
- All implementation must be blocked unless corresponding specs exist and are approved.
- Agents and skills defined in `.claude/` must be used for all decisions and changes.

Core Principles:
- Specification-First Development: Nothing is built without a written spec.
- Agentic Separation of Concerns: Each agent operates only within its defined scope.
- Security by Default: Authentication, authorization, and user isolation are mandatory.
- Deterministic Behavior: Same specs must produce the same implementation.
- Reviewability: Every change must be traceable to a spec, plan, or task.

Technology Constraints:
- Frontend: Next.js 16+ (App Router), TypeScript, Tailwind CSS
- Backend: Python FastAPI
- ORM: SQLModel
- Database: Neon Serverless PostgreSQL
- Authentication: Better Auth (frontend) + JWT verification (backend)
- Spec System: GitHub Spec-Kit Plus
- Repo Structure: Monorepo with /frontend and /backend

Authentication & Security Constitution:
- All API endpoints MUST require a valid JWT token.
- JWT tokens are issued by Better Auth on the frontend.
- Backend must verify JWT using shared secret via BETTER_AUTH_SECRET.
- Backend must NEVER trust user_id from request without JWT verification.
- User identity is derived ONLY from decoded JWT.
- All task operations must be filtered by authenticated user_id.
- Requests without valid JWT must return 401 Unauthorized.
- Token expiry must be respected; expired tokens are invalid.

API Standards:
- All backend routes must be under `/api/`.
- RESTful conventions must be followed.
- Endpoints include:
  GET    /api/{user_id}/tasks
  POST   /api/{user_id}/tasks
  GET    /api/{user_id}/tasks/{id}
  PUT    /api/{user_id}/tasks/{id}
  DELETE /api/{user_id}/tasks/{id}
  PATCH  /api/{user_id}/tasks/{id}/complete
- user_id in the URL must match the authenticated JWT user_id.

Database Standards:
- SQLModel must be used for all database operations.
- Tasks must include strict user ownership via user_id.
- Neon PostgreSQL compatibility is required.
- No schema changes without updating @specs/database/schema.md.

Frontend Standards:
- All backend requests must include Authorization: Bearer <token>.
- API access must go through a centralized API client.
- UI must be responsive (mobile, tablet, desktop).
- Authentication state must be managed via Better Auth session.

Agent & Skill Enforcement:
- spec-guardian-agent blocks implementation without specs.
- backend-agent handles FastAPI, SQLModel, JWT middleware.
- frontend-agent handles Next.js UI and API client integration.
- auth-integration-agent handles JWT bridge logic only.
- database-agent manages schema and data integrity.
- qa-validation-agent validates correctness, security, and spec compliance.
- Skills defined in `.claude/skills/` are binding constraints.

Phases:
- Current Phase: Phase II – Web Application
- Scope limited to:
  - Task CRUD
  - User Authentication
  - Multi-user data isolation
- Chatbot and AI features are explicitly out of scope.

Prohibited Actions:
- No manual human-written code.
- No bypassing JWT verification.
- No shared user data across accounts.
- No implementation without specs.
- No mixing frontend and backend responsibilities.

Success Criteria:
- All features implemented strictly from specs.
- All API routes secured with JWT authentication.
- Each user can only access their own tasks.
- Frontend and backend operate independently using shared JWT secret.
- QA agent validates security, correctness, and spec adherence.
- Project is fully reviewable via specs, plans, and tasks.

End of Constitution.

## Response snapshot

I have successfully updated the constitution file at `.specify/memory/constitution.md` with the specific requirements for the Todo Full-Stack Web Application. The new constitution includes:

1. Core Principles covering specification-first development, agentic separation of concerns, security by default, deterministic behavior, reviewability, and technology stack adherence.

2. Detailed sections on Authentication & Security Constitution, API Standards, Database Standards, Frontend Standards, and Agent & Skill Enforcement.

3. Clear prohibited actions and success criteria.

4. Updated governance section and version information.

The constitution now properly reflects the requirements for the agentic development workflow using Spec-Kit Plus, with strict adherence to security, authentication, and separation of concerns.

## Outcome

- ✅ Impact: Updated constitution with specific requirements for Todo Full-Stack Web Application
- 🧪 Tests: No tests required for constitution update
- 📁 Files: Updated .specify/memory/constitution.md with new principles and constraints
- 🔁 Next prompts: Ready for spec development phase
- 🧠 Reflection: Constitution now properly enforces agentic workflow and security requirements

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Begin spec development following the new constitution