# Phase III: Todo AI Chatbot Tasks

## Overview
This document outlines atomic, testable tasks for implementing the AI-powered Todo Chatbot that integrates with the existing Phase II Todo application while preserving all existing functionality. Tasks follow the sequence: Backend → Frontend → Testing → Documentation.

## Backend Tasks

### Task 1: Setup Environment Variables and Dependencies
**Description**: Configure environment variables and install required dependencies for Gemini API integration
**Dependencies**: None
**Files to modify**:
- `backend/.env`
- `backend/pyproject.toml`
- `backend/src/config/settings.py` (create if doesn't exist)

**Steps**:
1. Add `GEMINI_API_KEY` to `.env` file
2. Add required dependencies to `pyproject.toml`: `google-generativeai`, `openai`
3. Create configuration module to load settings
4. Add configuration validation

**Acceptance Criteria**:
- [ ] Environment variable for Gemini API key is properly configured
- [ ] Dependencies are added to pyproject.toml and can be installed
- [ ] Configuration module loads settings correctly
- [ ] Configuration validation passes

**Test Case**:
- Verify API key can be loaded from environment
- Verify dependencies can be imported without errors

---

### Task 2: Create Database Models for Conversations
**Description**: Implement SQLModel classes for Conversation and Message entities
**Dependencies**: Task 1
**Files to modify**:
- `backend/src/models/conversation.py` (create)
- `backend/src/models/__init__.py`

**Steps**:
1. Create Conversation model with id, user_id, title, timestamps
2. Create Message model with id, conversation_id, role, content, timestamp, metadata
3. Add proper foreign key relationships
4. Add indexes for performance
5. Update models __init__.py to include new models

**Acceptance Criteria**:
- [ ] Conversation model has proper fields and relationships
- [ ] Message model has proper fields and relationships
- [ ] Foreign key constraints are correctly defined
- [ ] Indexes are added for performance
- [ ] Models can be imported from models.__init__

**Test Case**:
- Verify models can be instantiated
- Verify relationships work correctly
- Verify database schema generation works

---

### Task 3: Create Conversation and Message Services
**Description**: Implement service layer functions for managing conversations and messages
**Dependencies**: Task 2
**Files to modify**:
- `backend/src/services/conversation_service.py` (create)
- `backend/src/services/message_service.py` (create)

**Steps**:
1. Implement `create_conversation(user_id)` function
2. Implement `get_conversation(conversation_id, user_id)` function
3. Implement `update_conversation_title(conversation_id, title)` function
4. Implement `create_message(conversation_id, role, content, metadata)` function
5. Implement `get_conversation_messages(conversation_id)` function
6. Add proper error handling and validation

**Acceptance Criteria**:
- [ ] All conversation service functions are implemented
- [ ] All message service functions are implemented
- [ ] Functions properly validate inputs
- [ ] Error handling is implemented
- [ ] Functions work with database sessions

**Test Case**:
- Create conversation and verify it's saved to database
- Create message and verify it's saved to database
- Retrieve conversation and messages successfully
- Verify error handling works correctly

---

### Task 4: Create MCP Tools for Task Operations
**Description**: Implement MCP-compatible tools for task management operations
**Dependencies**: Task 3
**Files to modify**:
- `backend/src/services/mcp_tool_service.py` (create)
- `backend/src/services/__init__.py`

**Steps**:
1. Create `add_task_tool` function that wraps existing task creation
2. Create `list_tasks_tool` function that wraps existing task listing
3. Create `update_task_tool` function that wraps existing task updating
4. Create `delete_task_tool` function that wraps existing task deletion
5. Create `complete_task_tool` function that wraps existing task completion
6. Add proper parameter validation and error handling
7. Ensure tools return structured responses for AI consumption

**Acceptance Criteria**:
- [ ] All MCP tool functions are implemented
- [ ] Tools properly wrap existing task service functions
- [ ] Parameter validation is implemented
- [ ] Error handling is implemented
- [ ] Tools return structured responses

**Test Case**:
- Execute add_task_tool and verify task is created
- Execute list_tasks_tool and verify tasks are returned
- Execute update_task_tool and verify task is updated
- Execute delete_task_tool and verify task is deleted
- Execute complete_task_tool and verify task completion

---

### Task 5: Setup AI Agent with Gemini Integration
**Description**: Configure the AI agent using Google's Gemini API via AsyncOpenAI
**Dependencies**: Task 1
**Files to modify**:
- `backend/src/ai/ai_agent.py` (create)
- `backend/src/ai/__init__.py` (create)

**Steps**:
1. Create AsyncOpenAI client configured for Gemini
2. Define tool schemas for each MCP tool
3. Initialize Agent with tools and configuration
4. Create helper functions to process conversation history
5. Add proper error handling for AI operations

**Acceptance Criteria**:
- [ ] AsyncOpenAI client is properly configured for Gemini
- [ ] All MCP tools are registered with the agent
- [ ] Tool schemas are properly defined
- [ ] Helper functions for conversation processing exist
- [ ] Error handling for AI operations is implemented

**Test Case**:
- Verify AI agent can be initialized
- Verify tools are properly registered
- Test basic AI response with mock conversation

---

### Task 6: Create Chat API Endpoint
**Description**: Implement the `/api/{user_id}/chat` endpoint with JWT authentication
**Dependencies**: Tasks 3, 4, 5
**Files to modify**:
- `backend/src/api/chat_routes.py` (create)
- `backend/src/main.py` (update to include chat routes)

**Steps**:
1. Create chat_routes.py with POST /api/{user_id}/chat endpoint
2. Implement JWT authentication validation
3. Validate that user_id from token matches path parameter
4. Parse request body with message and optional conversation_id
5. Create or retrieve conversation using conversation service
6. Store user message using message service
7. Process message with AI agent and MCP tools
8. Store AI response using message service
9. Return structured response with conversation_id, response, and tool_calls
10. Add proper error handling and validation

**Acceptance Criteria**:
- [ ] Chat endpoint is created at /api/{user_id}/chat
- [ ] JWT authentication is properly validated
- [ ] User_id validation works correctly
- [ ] Conversation creation/retrieval works
- [ ] Message storage and retrieval works
- [ ] AI processing with tools works
- [ ] Response structure is correct
- [ ] Error handling is implemented

**Test Case**:
- Send authenticated request and verify response
- Verify unauthorized requests are blocked
- Verify user_id mismatch is detected
- Verify conversation persistence works
- Verify tool calls are processed correctly

---

### Task 7: Backend Testing and Validation
**Description**: Create comprehensive tests for all backend components
**Dependencies**: Tasks 1-6
**Files to modify**:
- `backend/test_chat.py` (create)
- Update existing test files if needed

**Steps**:
1. Create unit tests for conversation service functions
2. Create unit tests for message service functions
3. Create unit tests for MCP tool functions
4. Create integration tests for chat endpoint
5. Create authentication tests for chat endpoint
6. Create conversation persistence tests
7. Create tool operation tests
8. Run all tests and verify they pass

**Acceptance Criteria**:
- [ ] Unit tests cover all service functions
- [ ] Integration tests cover chat endpoint
- [ ] Authentication tests verify security
- [ ] Persistence tests verify database operations
- [ ] Tool operation tests verify MCP functionality
- [ ] All tests pass successfully

**Test Case**:
- Run all unit tests and verify they pass
- Run all integration tests and verify they pass
- Verify test coverage is adequate

---

## Frontend Tasks

### Task 8: Create Chat Component Structure
**Description**: Build the foundational React component for the chat interface
**Dependencies**: None (can run in parallel with backend)
**Files to modify**:
- `frontend/src/components/ChatComponent.tsx` (create)
- `frontend/src/components/index.ts` (update to export ChatComponent)

**Steps**:
1. Create ChatComponent with React functional component
2. Define state for messages, input, loading, and conversation_id
3. Create message display area with proper styling
4. Create message input field with send button
5. Add loading indicators
6. Add error display area
7. Ensure responsive design

**Acceptance Criteria**:
- [ ] ChatComponent is created with proper structure
- [ ] State management is implemented for all required variables
- [ ] Message display area is styled appropriately
- [ ] Input field and send button are functional
- [ ] Loading indicators are displayed during processing
- [ ] Error messages can be displayed
- [ ] Component is responsive across device sizes

**Test Case**:
- Render component and verify structure
- Verify state updates work correctly
- Verify responsive design works

---

### Task 9: Implement Chat API Integration
**Description**: Connect the ChatComponent to the backend chat API
**Dependencies**: Task 8, Task 6 (backend endpoint)
**Files to modify**:
- `frontend/src/components/ChatComponent.tsx`
- `frontend/src/lib/api.ts` (update to add chat API functions)

**Steps**:
1. Create API function to call /api/{user_id}/chat endpoint
2. Implement token retrieval from auth context
3. Handle message submission to backend
4. Handle response from backend
5. Update UI state with new messages
6. Add proper error handling for API calls
7. Implement loading states during API calls

**Acceptance Criteria**:
- [ ] API function can call backend chat endpoint
- [ ] JWT token is properly retrieved and included
- [ ] Message submission works correctly
- [ ] Response handling updates UI properly
- [ ] Error handling displays appropriate messages
- [ ] Loading states are properly managed

**Test Case**:
- Submit message and verify API call is made
- Verify token is included in request
- Verify response is displayed correctly
- Verify error handling works

---

### Task 10: Integrate with Existing Authentication
**Description**: Ensure the chat component properly integrates with existing auth system
**Dependencies**: Task 9
**Files to modify**:
- `frontend/src/components/ChatComponent.tsx`
- `frontend/src/context/AuthContext.tsx` (if needed)

**Steps**:
1. Access authentication context/state in ChatComponent
2. Verify user is logged in before enabling chat
3. Extract user_id from authentication context
4. Pass user_id to API calls
5. Handle authentication errors gracefully
6. Show appropriate messages when not authenticated

**Acceptance Criteria**:
- [ ] Authentication context is properly accessed
- [ ] User authentication is verified before chat access
- [ ] User_id is extracted and passed to API calls
- [ ] Authentication errors are handled gracefully
- [ ] Appropriate messages are shown for unauthenticated users

**Test Case**:
- Verify chat is disabled when not logged in
- Verify user_id is correctly extracted when logged in
- Verify authentication errors are handled

---

### Task 11: Implement Task Operation Feedback
**Description**: Display task operation confirmations from MCP tools
**Dependencies**: Task 10
**Files to modify**:
- `frontend/src/components/ChatComponent.tsx`

**Steps**:
1. Parse tool_calls from AI response
2. Display task operation confirmations to user
3. Update task list in UI when tasks are modified
4. Show appropriate feedback for each operation type
5. Handle multiple tool calls in a single response

**Acceptance Criteria**:
- [ ] Tool calls from AI response are parsed correctly
- [ ] Task operation confirmations are displayed to user
- [ ] Task list updates when tasks are modified via chat
- [ ] Different operation types show appropriate feedback
- [ ] Multiple tool calls are handled properly

**Test Case**:
- Send message that triggers task creation and verify confirmation
- Send message that triggers task update and verify confirmation
- Verify task list updates accordingly

---

### Task 12: Frontend Testing
**Description**: Create comprehensive tests for the chat component
**Dependencies**: Tasks 8-11
**Files to modify**:
- `frontend/tests/ChatComponent.test.tsx` (create)

**Steps**:
1. Create unit tests for ChatComponent rendering
2. Create tests for API integration
3. Create tests for authentication integration
4. Create tests for task operation feedback
5. Mock API responses for testing
6. Run all tests and verify they pass

**Acceptance Criteria**:
- [ ] Unit tests cover component rendering
- [ ] API integration tests pass
- [ ] Authentication integration tests pass
- [ ] Task operation feedback tests pass
- [ ] All tests pass successfully

**Test Case**:
- Run all component tests and verify they pass
- Verify test coverage is adequate

---

## Integration & Final Testing Tasks

### Task 13: Full System Integration Test
**Description**: Test the complete system with backend and frontend working together
**Dependencies**: All previous tasks
**Files to modify**: None (testing task)

**Steps**:
1. Start backend server
2. Start frontend development server
3. Log in to application
4. Open chat interface
5. Send message requesting task operation
6. Verify task is created/updated/deleted as requested
7. Verify conversation is persisted
8. Verify UI updates correctly
9. Test multiple conversation flows

**Acceptance Criteria**:
- [ ] Backend and frontend can communicate successfully
- [ ] User can log in and access chat
- [ ] AI responds to natural language requests
- [ ] Task operations are performed correctly
- [ ] Conversations are persisted properly
- [ ] UI updates correctly after operations
- [ ] Multiple conversation flows work properly

**Test Case**:
- Complete end-to-end flow: login → chat → task operation → verification
- Test multiple different task operations
- Verify conversation history persists

---

### Task 14: Phase II Functionality Verification
**Description**: Ensure all existing Phase II functionality remains intact
**Dependencies**: Task 13
**Files to modify**: None (verification task)

**Steps**:
1. Test authentication flow (login/register)
2. Test user management features
3. Test task CRUD operations through original interfaces
4. Verify no regressions in existing functionality
5. Test concurrent usage of chat and traditional interfaces

**Acceptance Criteria**:
- [ ] Authentication continues to work as before
- [ ] User management features are unaffected
- [ ] Original task CRUD operations work correctly
- [ ] No regressions in Phase II functionality
- [ ] Both chat and traditional interfaces can be used simultaneously

**Test Case**:
- Perform all Phase II operations and verify they still work
- Use chat and traditional interfaces concurrently
- Verify no data corruption occurs

---

### Task 15: Documentation Updates
**Description**: Update project documentation to include Phase III features
**Dependencies**: All previous tasks
**Files to modify**:
- `README.md`
- `CLAUDE.md`
- `backend/README.md` (if exists)
- `frontend/README.md` (if exists)

**Steps**:
1. Update main README.md with Phase III features
2. Add instructions for setting up Gemini API key
3. Document the new chat endpoint
4. Update architecture diagrams to include chat features
5. Add usage examples for the chat interface
6. Update CLAUDE.md with new workflow considerations

**Acceptance Criteria**:
- [ ] Main README.md includes Phase III information
- [ ] Gemini API key setup instructions are clear
- [ ] New chat endpoint is documented
- [ ] Architecture diagrams include chat features
- [ ] Usage examples are provided
- [ ] CLAUDE.md is updated appropriately

**Test Case**:
- Verify documentation is clear and accurate
- Follow setup instructions to verify they work
- Check that all new features are documented