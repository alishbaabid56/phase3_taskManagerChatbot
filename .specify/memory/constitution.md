<!--
Sync Impact Report:
- Version change: 1.0.0 → 2.0.0
- Modified principles: All principles replaced with new ones
- Added sections: Authentication & Security Constitution, API Standards, Database Standards, Frontend Standards, Agent & Skill Enforcement
- Removed sections: Template placeholders
- Templates requiring updates: ✅ All templates updated
- Follow-up TODOs: None
-->
# Todo Full-Stack Web Application Constitution

## Core Principles

### Specification-First Development
Nothing is built without a written spec. All development must follow the Write Spec → Generate Plan → Break into Tasks → Implement workflow. Agents and skills defined in `.claude/` must be used for all decisions and changes.

### Agentic Separation of Concerns
Each agent operates only within its defined scope. The spec-guardian-agent blocks implementation without specs, backend-agent handles FastAPI and SQLModel, frontend-agent handles Next.js UI, auth-integration-agent handles JWT bridge logic, database-agent manages schema and data integrity, ai-chatbot-agent handles OpenAI Agents SDK and MCP Server integration, and qa-validation-agent validates correctness and security.

### Security by Default
Authentication, authorization, and user isolation are mandatory. All API endpoints MUST require a valid JWT token. Backend must verify JWT using shared secret via BETTER_AUTH_SECRET. User identity is derived ONLY from decoded JWT. All task operations must be filtered by authenticated user_id.

### Deterministic Behavior
Same specs must produce the same implementation. The development process must be reproducible and consistent across different environments and executions.

### Reviewability
Every change must be traceable to a spec, plan, or task. All development activities must be documented and reviewable through the spec-driven workflow.

### Technology Stack Adherence
All development must use the approved technology stack:
- Frontend: Next.js 16+ (App Router), TypeScript, Tailwind CSS
- Backend: Python FastAPI, OpenAI Agents SDK, MCP Server
- ORM: SQLModel
- Database: Neon Serverless PostgreSQL
- Authentication: Better Auth (frontend) + JWT verification (backend)
- AI Integration: OpenAI Agents SDK, MCP Server (Official SDK)
- Architecture: Stateless chat architecture

## Authentication & Security Constitution
- All API endpoints MUST require a valid JWT token.
- JWT tokens are issued by Better Auth on the frontend.
- Backend must verify JWT using shared secret via BETTER_AUTH_SECRET.
- Backend must NEVER trust user_id from request without JWT verification.
- User identity is derived ONLY from decoded JWT.
- All task operations must be filtered by authenticated user_id.
- Requests without valid JWT must return 401 Unauthorized.
- Token expiry must be respected; expired tokens are invalid.
- EXISTING AUTHENTICATION LOGIC IS IMMUTABLE: Authentication and user management code from Phase II must NOT be refactored, modified, or broken during Phase III development unless explicitly approved through formal amendment process.
- Phase III AI Chatbot integration must work alongside existing authentication without modifying core auth flows.

## API Standards
- All backend routes must be under `/api/`.
- RESTful conventions must be followed.
- Existing endpoints include:
  GET    /api/{user_id}/tasks
  POST   /api/{user_id}/tasks
  GET    /api/{user_id}/tasks/{id}
  PUT    /api/{user_id}/tasks/{id}
  DELETE /api/{user_id}/tasks/{id}
  PATCH  /api/{user_id}/tasks/{id}/complete
- New Phase III endpoints include:
  POST   /api/{user_id}/chat
- user_id in the URL must match the authenticated JWT user_id.
- All endpoints must enforce JWT authentication and user isolation.
- The /api/{user_id}/chat endpoint must be stateless with conversation state persisted in database.

## Database Standards
- SQLModel must be used for all database operations.
- Tasks must include strict user ownership via user_id.
- Neon PostgreSQL compatibility is required.
- No schema changes without updating @specs/database/schema.md.
- Phase III conversation state must be persisted in database using SQLModel.
- Conversation records must include user_id for proper isolation.
- Conversation history must be stored with timestamps for ordering.

## Frontend Standards
- All backend requests must include Authorization: Bearer <token>.
- API access must go through a centralized API client.
- UI must be responsive (mobile, tablet, desktop).
- Authentication state must be managed via Better Auth session.
- CHATKIT IS PROHIBITED: ChatKit and any disallowed frontend chat technologies are NOT permitted for Phase III implementation.
- Phase III chat interface must be built using allowed frontend stack (Next.js, TypeScript, Tailwind CSS).
- Chat UI must integrate with new /api/{user_id}/chat endpoint.

## Agent & Skill Enforcement
- spec-guardian-agent blocks implementation without specs.
- backend-agent handles FastAPI, SQLModel, JWT middleware.
- frontend-agent handles Next.js UI and API client integration.
- auth-integration-agent handles JWT bridge logic only.
- database-agent manages schema and data integrity.
- ai-chatbot-agent handles OpenAI Agents SDK, MCP Server integration, and stateless chat architecture.
- qa-validation-agent validates correctness, security, and spec compliance.
- Skills defined in `.claude/skills/` are binding constraints.

## Prohibited Actions
- No manual human-written code.
- No bypassing JWT verification.
- No shared user data across accounts.
- No implementation without specs.
- No mixing frontend and backend responsibilities.
- No Phase III development without following Spec → Plan → Tasks → Implement workflow (NON-NEGOTIABLE).
- No refactoring of existing authentication logic during Phase III feature development.
- No introduction of ChatKit or other disallowed frontend technologies.
- No manual coding outside of spec-driven workflow.

## Success Criteria
- All features implemented strictly from specs.
- All API routes secured with JWT authentication.
- Each user can only access their own tasks.
- Frontend and backend operate independently using shared JWT secret.
- QA agent validates security, correctness, and spec adherence.
- Project is fully reviewable via specs, plans, and tasks.
- Phase III AI Chatbot successfully integrated with MCP Server and OpenAI Agents SDK.
- Stateless chat architecture implemented with database-persisted conversation state.
- All existing Phase II functionality remains unbroken and operational.
- Phase III features follow the same security standards as existing features.
- Natural language task management works through AI chat interface.

## Governance

All development must be performed through Claude Code agents using Spec-Kit Plus. No manual coding by the human is permitted. The constitution supersedes all other practices. Amendments require proper documentation and approval. All implementation must be blocked unless corresponding specs exist and are approved.

**Version**: 2.0.0 | **Ratified**: 2025-01-01 | **Last Amended**: 2025-12-31