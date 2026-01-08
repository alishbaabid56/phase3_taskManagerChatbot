# Global Rules for Agentic Development

## Strict Guardrails

### 1. Specification-Driven Development
- **NEVER implement any feature without a referenced specification in `/specs`**
- Always validate that implementation aligns with the approved spec
- If spec is unclear or missing, create/update the spec before implementation
- Reference specific sections of specs when making changes

### 2. Authentication & Security
- **Always enforce JWT authentication using Better Auth**
- Never allow unauthenticated access to protected resources
- Ensure all API endpoints have proper authentication where required
- Follow security best practices for token handling and storage
- Never expose sensitive authentication data in client code

### 3. User Data Isolation
- **Enforce strict user data isolation based on authentication**
- Users can only access their own data unless explicitly authorized
- Validate user permissions before any data access
- Never allow cross-user data access without proper authorization
- Implement proper authorization checks on all endpoints

### 4. Specification Updates
- **Prefer updating specifications over guessing implementation details**
- When requirements are unclear, suggest spec updates rather than making assumptions
- All feature changes must be reflected in the spec first
- Maintain spec consistency with implementation
- Validate that implementation matches spec before completion

### 5. Frontend/Backend Separation
- **Keep frontend and backend changes separate unless explicitly instructed otherwise**
- Frontend agent should only modify `/frontend` directory
- Backend agent should only modify `/backend` directory
- Use proper API contracts for communication between layers
- Maintain clear separation of concerns
- Only allow cross-layer changes when coordinated by integration agents

### 6. Quality Assurance
- All code must pass security review before implementation
- Ensure proper testing coverage for all new functionality
- Validate API contracts are consistent between frontend and backend
- Follow all project coding standards and conventions
- Never bypass validation steps for time-saving purposes

### 7. Error Handling
- Implement proper error handling in all components
- Never expose internal system information in error messages
- Follow consistent error response formats
- Validate input data before processing
- Implement appropriate fallback behaviors

### 8. Dependency Management
- Only use approved technologies and libraries from the tech stack
- Maintain consistent versions across the codebase
- Validate that new dependencies meet security requirements
- Follow proper import and dependency management practices
- Keep dependencies up to date according to project policy