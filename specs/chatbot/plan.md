# Phase III: Todo AI Chatbot Implementation Plan

## Overview
This plan outlines the implementation of the AI-powered Todo Chatbot that integrates with the existing Phase II Todo application while preserving all existing functionality. The implementation follows a backend-first approach with proper authentication, database persistence, and MCP integration.

## Architecture & Component Design

### Backend Components
1. **Database Models**:
   - `Conversation` model for tracking conversation sessions
   - `Message` model for storing conversation history
   - Leverage existing `Task` model for task operations

2. **Service Layer**:
   - `conversation_service.py`: Manage conversation lifecycle
   - `message_service.py`: Handle message creation and retrieval
   - `mcp_tool_service.py`: MCP tools for task operations (add, list, update, delete, complete)

3. **API Routes**:
   - `chat_routes.py`: New `/api/{user_id}/chat` endpoint

4. **AI Integration**:
   - Integrate Google's Gemini API via AsyncOpenAI
   - MCP server for tool orchestration

## Implementation Phases

### Phase 1: Backend Infrastructure (Days 1-2)

#### 1.1 Database Schema Extensions
- Create `Conversation` model with fields: id, user_id, created_at, updated_at, title
- Create `Message` model with fields: id, conversation_id, role, content, timestamp, metadata
- Add appropriate indexes for performance
- Update alembic migrations to include new tables

#### 1.2 Service Layer Development
- Implement `conversation_service.py`:
  - `create_conversation(user_id)` - Create new conversation session
  - `get_conversation(conversation_id, user_id)` - Retrieve conversation
  - `update_conversation_title(conversation_id, title)` - Update conversation title
- Implement `message_service.py`:
  - `create_message(conversation_id, role, content, metadata)` - Store messages
  - `get_conversation_messages(conversation_id)` - Retrieve message history
- Implement `mcp_tool_service.py`:
  - Reuse existing task service functions for MCP tool implementations
  - Create wrapper functions for MCP tool compatibility

#### 1.3 AI Agent Setup
- Install required dependencies: `openai`, `google-generativeai`
- Configure Gemini API integration
- Set up MCP server configuration
- Create AI agent with task management tools

#### 1.4 Chat Endpoint Implementation
- Create `chat_routes.py`
- Implement `/api/{user_id}/chat` POST endpoint
- Add JWT authentication validation
- Ensure user_id from URL matches JWT token
- Implement conversation persistence logic
- Add error handling for all scenarios

### Phase 2: Frontend Integration (Days 3-4)

#### 2.1 Chat Component Development
- Create `ChatComponent` in frontend/src/components/
- Implement message display with proper formatting
- Add message input field with send functionality
- Integrate with existing authentication system
- Handle token retrieval and inclusion in requests

#### 2.2 UI Integration
- Add chat interface to dashboard page
- Ensure responsive design compatibility
- Add loading states for AI responses
- Display error messages appropriately

#### 2.3 State Management
- Update frontend state to reflect task changes from chat
- Sync task list with chat operations
- Maintain conversation context across page refreshes

### Phase 3: Testing & Validation (Day 5)

#### 3.1 Backend Testing
- Unit tests for new service functions
- Integration tests for chat endpoint
- Authentication validation tests
- Conversation persistence tests
- MCP tool functionality tests

#### 3.2 Frontend Testing
- Component tests for ChatComponent
- Integration tests for API communication
- Authentication flow tests
- Task operation validation

#### 3.3 End-to-End Testing
- Complete user flow testing
- Verify existing Phase II functionality remains intact
- Performance testing for chat responses
- Security validation

## Technical Implementation Details

### Database Schema

#### Conversation Model
```python
class Conversation(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", nullable=False)
    title: Optional[str] = Field(default=None, max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    __table_args__ = (
        Index("idx_conversation_user_id", "user_id"),
        Index("idx_conversation_created_at", "created_at"),
    )
```

#### Message Model
```python
class Message(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    conversation_id: uuid.UUID = Field(foreign_key="conversation.id", nullable=False)
    role: str = Field(sa_column=Column(Enum("user", "assistant", "system", name="message_role")))
    content: str = Field(sa_column=Column(Text))
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[dict] = Field(default=None, sa_column=Column(JSON))

    __table_args__ = (
        Index("idx_message_conversation_id", "conversation_id"),
        Index("idx_message_timestamp", "timestamp"),
    )
```

### API Endpoint Design
```
POST /api/{user_id}/chat
Headers:
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json

Body:
{
  "message": "Natural language task request",
  "conversation_id": "Optional conversation ID to continue"
}

Response:
{
  "conversation_id": "ID of the conversation",
  "response": "AI-generated response",
  "tool_calls": "Array of tool calls executed",
  "timestamp": "ISO timestamp"
}
```

### MCP Tools Implementation
- `add_task_tool`: Creates new tasks using existing task service
- `list_tasks_tool`: Retrieves tasks with filtering options
- `update_task_tool`: Updates existing tasks
- `delete_task_tool`: Removes tasks
- `complete_task_tool`: Marks tasks as completed

### Security Considerations
- Validate JWT token for every request
- Ensure user_id in URL matches JWT token user_id
- Sanitize all user inputs
- Implement rate limiting if needed
- Secure API keys in environment variables

## Dependencies to Add

### Backend
```toml
# pyproject.toml additions
google-generativeai = "^0.5.0"
openai = "^1.10.0"
mcp-server = "^1.0.0"  # Placeholder - use actual MCP package
```

### Frontend
```json
// package.json additions
{
  "@types/google.accounts": "^0.0.12",
  "react-markdown": "^9.0.1"
}
```

## Risk Mitigation

### Potential Issues & Solutions
1. **Authentication conflicts**: Ensure new endpoint follows same auth pattern as existing endpoints
2. **Database performance**: Add proper indexing for conversation/message queries
3. **AI response delays**: Implement proper loading states and timeouts
4. **Token limits**: Handle long conversations efficiently
5. **Concurrent access**: Implement proper session management

## Success Criteria

### Backend Deliverables
- [ ] Working `/api/{user_id}/chat` endpoint
- [ ] Proper JWT authentication validation
- [ ] Conversation state persistence
- [ ] MCP tools integration with task operations
- [ ] Comprehensive error handling
- [ ] All existing Phase II functionality preserved

### Frontend Deliverables
- [ ] Integrated ChatComponent
- [ ] Proper authentication token handling
- [ ] Real-time task updates from chat
- [ ] Responsive and user-friendly interface
- [ ] Loading and error states

### Testing Deliverables
- [ ] Unit tests for all new services
- [ ] Integration tests for chat endpoint
- [ ] End-to-end tests confirming Phase II functionality intact
- [ ] Security validation completed

## Rollback Plan
If implementation causes issues with existing functionality:
1. Revert new endpoint additions
2. Drop new database tables
3. Remove new dependencies
4. Restore previous working state