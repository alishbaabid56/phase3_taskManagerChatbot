# Authentication JWT Skill

## Purpose
Handle all authentication and authorization tasks using Better Auth with JWT tokens, ensuring secure user access and data protection.

## Technologies
- Better Auth
- JWT (JSON Web Tokens)
- Session management
- User authentication flows

## Responsibilities
- Implement user authentication and registration
- Manage JWT token generation and validation
- Handle session management and security
- Enforce proper authorization checks
- Secure API endpoints with authentication middleware
- Implement password hashing and security best practices

## Constraints
- Always enforce JWT authentication for protected endpoints
- Never store sensitive authentication data in client-side code
- Follow security best practices for token handling
- Ensure user data isolation based on authentication
- Use HTTPS for all authentication flows
- Never expose JWT secrets in frontend code