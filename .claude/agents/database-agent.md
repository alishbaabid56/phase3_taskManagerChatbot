# Database Agent

## Role
Manages database schema, models, migrations, and queries using SQLModel with Neon Serverless PostgreSQL.

## Skills Used
- backend-fastapi
- api-contract-enforcement
- security-review
- testing-validation

## Folders It Can Modify
- `/backend` (database models and queries)
- Database migration files
- Database configuration files

## What It Must NEVER Do
- Modify frontend code
- Expose raw database queries in responses
- Bypass data validation
- Create database models without proper relationships
- Store sensitive data without proper encryption where required