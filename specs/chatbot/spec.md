# Phase III: Todo AI Chatbot Specification

## Overview

This specification defines the AI Chatbot integration for the existing Todo application (Phase II). The chatbot will enable natural language interaction with the task management system while maintaining all existing Phase II functionality (authentication, user management, and task CRUD operations).

### Goals
- Enable natural language task management through an AI chat interface
- Integrate seamlessly with existing authentication and user systems
- Maintain backward compatibility with all Phase II features
- Implement stateless architecture with database-persisted conversation history

### Non-Goals
- Modify existing authentication logic
- Change existing task management APIs
- Refactor Phase II codebase components
- Introduce breaking changes to existing functionality

## Architecture Overview

```
┌─────────────┐    ┌──────────────────┐    ┌──────────────────┐    ┌─────────────┐
│   User      │    │   Next.js        │    │   FastAPI        │    │   MCP       │
│             │ -> │   /api/chat      │ -> │   /api/{user_id} │ -> │   Tools     │
│   Chat UI   │    │                  │    │   /chat          │    │             │
└─────────────┘    └──────────────────┘    └──────────────────┘    └─────────────┘
                           │                         │                       │
                           ▼                         ▼                       ▼
                    ┌─────────────────┐    ┌──────────────────┐    ┌─────────────┐
                    │   JWT Token     │    │   Conversation   │    │   Database  │
                    │   Verification  │    │   Persistence    │    │   (Neon)    │
                    └─────────────────┘    └──────────────────┘    └─────────────┘
```

### Key Components
- **Frontend Chat Interface**: Next.js-based chat UI integrated with existing application
- **Stateless Chat Endpoint**: `/api/{user_id}/chat` endpoint that extracts user_id from JWT
- **MCP Integration**: MCP tools for task operations (add/list/complete/delete/update)
- **Database Layer**: Neon PostgreSQL via SQLModel for conversation state persistence

## Database Models

### Conversation Model
```sql
Table: conversations
- id (UUID, Primary Key, Auto-generated)
- user_id (UUID, Foreign Key to users table)
- created_at (TIMESTAMP, Default: NOW())
- updated_at (TIMESTAMP, Default: NOW())
- title (VARCHAR(255), Optional, Auto-generated from first message)
```

### Message Model
```sql
Table: messages
- id (UUID, Primary Key, Auto-generated)
- conversation_id (UUID, Foreign Key to conversations table)
- role (ENUM: 'user', 'assistant', 'system')
- content (TEXT, The message content)
- timestamp (TIMESTAMP, Default: NOW())
- metadata (JSONB, Additional data like tool calls, etc.)
```

### Task Model (Reused from Phase II)
```sql
Table: tasks (existing from Phase II)
- id (UUID, Primary Key, Auto-generated)
- user_id (UUID, Foreign Key to users table)
- title (VARCHAR(255), Required)
- description (TEXT, Optional)
- completed (BOOLEAN, Default: FALSE)
- created_at (TIMESTAMP, Default: NOW())
- updated_at (TIMESTAMP, Default: NOW())
- completed_at (TIMESTAMP, Nullable)
```

## API Specification

### Chat Endpoint
```
POST /api/{user_id}/chat
```

#### Headers
- `Authorization: Bearer <JWT_TOKEN>` (Required)
- `Content-Type: application/json`

#### Parameters
- `user_id`: UUID from URL path, validated against JWT token

#### Request Body
```json
{
  "message": "String containing user's natural language request",
  "conversation_id": "Optional UUID for continuing conversation, null for new conversation"
}
```

#### Response Body
```json
{
  "conversation_id": "UUID of the conversation",
  "response": "AI-generated response to the user's message",
  "tool_calls": "Array of tool calls made during processing (optional)",
  "timestamp": "ISO 8601 timestamp of response"
}
```

#### Error Responses
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User_id in URL doesn't match JWT user_id
- `422 Unprocessable Entity`: Invalid request format
- `500 Internal Server Error`: Processing errors

## MCP Tools Specification

### add_task
**Purpose**: Create a new task for the authenticated user

**Input Format**:
```json
{
  "title": "String, required, task title",
  "description": "String, optional, task description"
}
```

**Output Format**:
```json
{
  "success": "Boolean indicating success",
  "task_id": "UUID of created task",
  "message": "Human-readable confirmation message"
}
```

**Example Usage**:
```json
{
  "title": "Buy groceries",
  "description": "Milk, bread, eggs"
}
```

### list_tasks
**Purpose**: Retrieve all tasks for the authenticated user

**Input Format**:
```json
{
  "filter": "String, optional, one of: 'all', 'active', 'completed'"
}
```

**Output Format**:
```json
{
  "tasks": [
    {
      "id": "UUID of task",
      "title": "Task title",
      "description": "Task description",
      "completed": "Boolean",
      "created_at": "ISO 8601 timestamp",
      "completed_at": "ISO 8601 timestamp or null"
    }
  ],
  "total_count": "Integer total number of tasks matching filter"
}
```

**Example Usage**:
```json
{
  "filter": "active"
}
```

### complete_task
**Purpose**: Mark a task as completed

**Input Format**:
```json
{
  "task_id": "UUID of task to complete"
}
```

**Output Format**:
```json
{
  "success": "Boolean indicating success",
  "message": "Human-readable confirmation message"
}
```

**Example Usage**:
```json
{
  "task_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### delete_task
**Purpose**: Delete a task

**Input Format**:
```json
{
  "task_id": "UUID of task to delete"
}
```

**Output Format**:
```json
{
  "success": "Boolean indicating success",
  "message": "Human-readable confirmation message"
}
```

**Example Usage**:
```json
{
  "task_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### update_task
**Purpose**: Update task properties

**Input Format**:
```json
{
  "task_id": "UUID of task to update",
  "title": "String, optional, new title",
  "description": "String, optional, new description",
  "completed": "Boolean, optional, completion status"
}
```

**Output Format**:
```json
{
  "success": "Boolean indicating success",
  "message": "Human-readable confirmation message"
}
```

**Example Usage**:
```json
{
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Updated task title",
  "completed": true
}
```

## Conversation Flow

### Stateless Request Cycle
1. User sends message to `/api/{user_id}/chat` with JWT token
2. Backend verifies JWT and confirms user_id matches token
3. If new conversation (no conversation_id provided):
   - Create new conversation record in database
4. Store user's message in database
5. Pass conversation history to AI agent via MCP tools
6. AI agent processes request and calls appropriate MCP tools
7. Collect tool responses and generate AI response
8. Store AI response in database
9. Return response to user

### Message Processing
1. Extract user intent from natural language message
2. Map intent to appropriate MCP tool(s)
3. Execute tool(s) with extracted parameters
4. Format tool results for AI consumption
5. Generate natural language response
6. Store both tool calls and response in message history

### Error Handling
- If JWT validation fails, return 401
- If user_id mismatch occurs, return 403
- If tool execution fails, log error and return informative message to user
- If AI processing fails, return 500 with generic error message

## Natural Language Command Mapping

| User Command | MCP Tool Called | Parameters |
|--------------|-----------------|------------|
| "Add a task to buy milk" | add_task | `{ "title": "buy milk", "description": "" }` |
| "Create a task called 'groceries' with description 'milk and bread'" | add_task | `{ "title": "groceries", "description": "milk and bread" }` |
| "Show me my tasks" | list_tasks | `{ "filter": "all" }` |
| "What are my incomplete tasks?" | list_tasks | `{ "filter": "active" }` |
| "List completed tasks" | list_tasks | `{ "filter": "completed" }` |
| "Complete task 'buy milk'" | complete_task | `{ "task_id": "[resolved task ID]" }` |
| "Mark grocery task as done" | complete_task | `{ "task_id": "[resolved task ID]" }` |
| "Delete the meeting task" | delete_task | `{ "task_id": "[resolved task ID]" }` |
| "Remove task about doctor appointment" | delete_task | `{ "task_id": "[resolved task ID]" }` |
| "Update task 'groceries' to 'weekly groceries'" | update_task | `{ "task_id": "[resolved task ID]", "title": "weekly groceries" }` |
| "Change description of 'work project' to 'important'" | update_task | `{ "task_id": "[resolved task ID]", "description": "important" }` |
| "Mark task as completed" | complete_task | `{ "task_id": "[resolved task ID]" }` |

## Security & Compatibility

### Authentication Enforcement
- All chat requests must include valid JWT token
- User_id in URL path must match user_id in JWT token
- Backend must verify token signature using BETTER_AUTH_SECRET
- Expired tokens must be rejected with 401 status

### Data Isolation
- Users can only access their own conversations
- Task operations are restricted to user's own tasks
- Conversation history is isolated by user_id

### Backward Compatibility
- All existing Phase II API endpoints remain unchanged
- Existing authentication flow continues to work
- Task management functionality remains identical
- No database schema changes to existing tables
- No breaking changes to existing client applications

## Implementation Constraints

### Technology Stack
- Backend: Python FastAPI
- AI Integration: OpenAI Agents SDK
- MCP Integration: Official MCP Server SDK
- Database: SQLModel with Neon PostgreSQL
- Frontend: Next.js 16+, TypeScript, Tailwind CSS (no ChatKit)

### Architecture Requirements
- Stateless chat endpoint (no server-side session storage)
- Conversation state persisted in database
- MCP tools must interact with existing task management system
- JWT token verification for all requests

### Performance Requirements
- Response time under 3 seconds for typical requests
- Handle concurrent users without performance degradation
- Efficient database queries for conversation history

## Acceptance Criteria

### Functional Requirements
- [ ] Users can interact with task management system using natural language
- [ ] All MCP tools function correctly through AI agent
- [ ] Conversation history persists between sessions
- [ ] Authentication is enforced for all chat operations
- [ ] Existing Phase II features remain fully functional
- [ ] Task operations respect user ownership and isolation

### Quality Requirements
- [ ] All API endpoints properly secured with JWT verification
- [ ] Error handling implemented for all failure scenarios
- [ ] Database operations properly validated and sanitized
- [ ] MCP tools return appropriate success/failure indicators
- [ ] Response formatting is consistent and user-friendly

### Compatibility Requirements
- [ ] No breaking changes to existing API endpoints
- [ ] Existing authentication flow continues to work
- [ ] Database schema additions are backward compatible
- [ ] Client applications can continue to use existing functionality