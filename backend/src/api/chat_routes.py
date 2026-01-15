# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlmodel import Session
# from typing import Dict, Any
# import json
# import re

# from ..database.database import get_session
# from ..models.user import User
# from ..models.conversation import MessageCreate, Conversation
# from ..models.task import TaskCreate, TaskUpdate
# from ..services.auth import get_current_user
# from ..services.conversation_service import (
#     create_conversation, get_conversation, create_message,
#     get_conversation_messages
# )
# from ..services.mcp_tool_service import MCPTaskTools, get_mcp_tools
# from ..services.task_service import (
#     create_task, get_tasks_by_user, get_task_by_id,
#     update_task, delete_task, mark_task_complete
# )
# from ..ai import ai_agent

# router = APIRouter(prefix="/api/{user_id}", tags=["chat"])

# @router.post("/chat")
# def chat_endpoint(
#     user_id: str,
#     message_request: Dict[str, Any],
#     current_user: User = Depends(get_current_user),
#     session: Session = Depends(get_session)
# ):
#     """
#     Chat endpoint that processes user messages with AI and MCP tools
#     """

#     # ✅ Validate authenticated user
#     if str(current_user.id) != user_id:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Not authorized to access this user's chat"
#         )

#     # ✅ Extract user message and optional conversation_id
#     user_message = message_request.get("message", "")
#     conversation_id = message_request.get("conversation_id", None)

#     if not user_message:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Message is required"
#         )

#     # ✅ Get or create conversation
#     if conversation_id:
#         conversation = get_conversation(session, conversation_id, user_id)
#         if not conversation:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail="Conversation not found or does not belong to user"
#             )
#     else:
#         conversation = create_conversation(session, user_id)
#         conversation_id = str(conversation.id)

#     # ✅ Store user message
#     create_message(
#         session=session,
#         conversation_id=conversation_id,
#         role="user",
#         content=user_message,
#         metadata={"type": "user_input"}
#     )

#     # ✅ Fetch conversation history
#     conversation_history = get_conversation_messages(session, conversation_id)
#     formatted_history = [
#         {"role": m.role, "content": m.content} for m in conversation_history[:-1]
#     ]

#     # ✅ Initialize MCP tools for task operations
#     mcp_tools = MCPTaskTools(session)

#     # ✅ Prepare input for AI agent
#     history_text = "\n".join([f"{m['role']}: {m['content']}" for m in formatted_history])
#     final_input = f"{history_text}\nUser: {user_message}"

#     # ✅ Initialize AI response content
#     ai_response_content = ""

#     # ✅ Initialize MCP tools for task operations
#     mcp_tools = MCPTaskTools(session)
#     tools = get_mcp_tools()

#     # ✅ Check if the AI response suggests task operations and execute them
#     tool_results = []

#     # Get conversation context to determine if we're in a multi-step process
#     conversation_context = {}
#     if conversation_history:
#         # Look at recent messages to see if we're in a task creation/editing flow
#         recent_messages = conversation_history[-5:]  # Last 5 messages
#         for msg in recent_messages:
#             if "asking for description" in msg.content.lower() or "what's the description" in msg.content.lower():
#                 conversation_context["awaiting_description"] = True
#             elif "what's the due date" in msg.content.lower():
#                 conversation_context["awaiting_due_date"] = True
#             elif "which task" in msg.content.lower() and "edit" in msg.content.lower():
#                 conversation_context["awaiting_edit_field"] = True

#     # Look for patterns that indicate task operations
#     user_message_lower = user_message.lower()

#     # Handle task creation with multi-step flow
#     if any(keyword in user_message_lower for keyword in ["add", "create", "new"]) and any(keyword in user_message_lower for keyword in ["task", "todo"]):
#         # Check if we're in the middle of a task creation conversation
#         awaiting_desc_or_date = any("would you like to add a description" in msg.content.lower() for msg in conversation_history[-3:])

#         if awaiting_desc_or_date:
#             # We're continuing a task creation flow
#             # Find the most recently created task
#             user_tasks = get_tasks_by_user(session, user_id)

#             # Sort by creation date to find the most recent task
#             if user_tasks:
#                 latest_task = max(user_tasks, key=lambda t: t.created_at)

#                 # Check if this message is for description or due date
#                 if any(word in user_message_lower for word in ["yes", "sure", "ok", "describe", "description", "detail", "info", "more"]):
#                     # User wants to add more details
#                     ai_response_content = f"What description would you like to add to the task '{latest_task.title}'?"
#                 elif "no" in user_message_lower and "thank" in user_message_lower:
#                     # User is declining to add more details
#                     ai_response_content = f"Okay, the task '{latest_task.title}' has been created as is."
#                 else:
#                     # This is probably a description
#                     # Update the task with the description
#                     task_update = TaskUpdate(description=user_message.strip())
#                     updated_task = update_task(session, str(latest_task.id), task_update, user_id)

#                     if updated_task:
#                         ai_response_content = f"Added description to task '{latest_task.title}'. Is there anything else you'd like to update?"
#                     else:
#                         ai_response_content = f"I've created the task '{latest_task.title}', but couldn't update the description."
#             else:
#                 # If no tasks exist, treat as a new task
#                 # Extract task title from initial request
#                 task_title = None
#                 create_patterns = [
#                     r"(?:add|create|make|new)\s+(?:a\s+)?(?:task|todo)\s+to\s+(.+?)(?:\s|$|[.!?]|,|and\s+\w+)",
#                     r"(?:add|create|make|new)\s+(.+?)\s+(?:as\s+a|to\s+my)\s+(?:task|todo)",
#                     r"(?:task|todo)[:\s]+(.+?)(?:\s|$|[.!?])",
#                     r"(?:add|create|make|new)\s+(.+?)(?:\s+(?:task|todo)|\s+(?:to|for)\s+\w+|\s*$|[.!?])"
#                 ]

#                 for pattern in create_patterns:
#                     matches = re.findall(pattern, user_message, re.IGNORECASE)
#                     if matches:
#                         task_title = matches[0].strip().strip('"\'').strip()
#                         if task_title.lower().startswith('to '):
#                             task_title = task_title[3:].strip()
#                         if task_title and task_title.lower() not in ['a', 'an', 'the', 'to']:
#                             break

#                 if task_title:
#                     # Create the task with just the title for now
#                     task_create = TaskCreate(title=task_title, description="")
#                     created_task = create_task(session, task_create, user_id)

#                     # Create a tool result
#                     tool_result = {
#                         "function": {"name": "add_task"},
#                         "result": {
#                             "success": True,
#                             "message": f"Task '{task_title}' has been created successfully!",
#                             "task_id": str(created_task.id)
#                         }
#                     }
#                     tool_results.append(tool_result)

#                     # Update the AI response to confirm the task creation and ask for more details
#                     ai_response_content = f"I've created the task '{task_title}' for you. Would you like to add a description to this task?"
#                 else:
#                     # If no title was found, ask for it
#                     ai_response_content = "What would you like to name your task? Please provide a task title."
#         else:
#             # Extract task title from initial request
#             task_title = None
#             create_patterns = [
#                 r"(?:add|create|make|new)\s+(?:a\s+)?(?:task|todo)\s+to\s+(.+?)(?:\s|$|[.!?]|,|and\s+\w+)",
#                 r"(?:add|create|make|new)\s+(.+?)\s+(?:as\s+a|to\s+my)\s+(?:task|todo)",
#                 r"(?:task|todo)[:\s]+(.+?)(?:\s|$|[.!?])",
#                 r"(?:add|create|make|new)\s+(.+?)(?:\s+(?:task|todo)|\s+(?:to|for)\s+\w+|\s*$|[.!?])"
#             ]

#             for pattern in create_patterns:
#                 matches = re.findall(pattern, user_message, re.IGNORECASE)
#                 if matches:
#                     task_title = matches[0].strip().strip('"\'').strip()
#                     if task_title.lower().startswith('to '):
#                         task_title = task_title[3:].strip()
#                     if task_title and task_title.lower() not in ['a', 'an', 'the', 'to']:
#                         break

#             if task_title:
#                 # Create the task with just the title for now
#                 task_create = TaskCreate(title=task_title, description="")
#                 created_task = create_task(session, task_create, user_id)

#                 # Create a tool result
#                 tool_result = {
#                     "function": {"name": "add_task"},
#                     "result": {
#                         "success": True,
#                         "message": f"Task '{task_title}' has been created successfully!",
#                         "task_id": str(created_task.id)
#                     }
#                 }
#                 tool_results.append(tool_result)

#                 # Update the AI response to confirm the task creation and ask for more details
#                 ai_response_content = f"I've created the task '{task_title}' for you. Would you like to add a description to this task?"
#             else:
#                 # If no title was found, ask for it
#                 ai_response_content = "What would you like to name your task? Please provide a task title."

#     # Handle task listing commands
#     elif any(keyword in user_message_lower for keyword in ["show", "list", "view", "display", "see", "my"]) and any(keyword in user_message_lower for keyword in ["tasks", "todos", "todo"]):
#         try:
#             # Get tasks for the user
#             user_tasks = get_tasks_by_user(session, user_id)

#             if user_tasks:
#                 task_details = []
#                 for task in user_tasks:
#                     status = "completed" if task.completed else "pending"
#                     # Use updated_at for due date or created_at if no due date field exists
#                     date_str = f", updated: {task.updated_at.strftime('%Y-%m-%d')}" if task.updated_at else f", created: {task.created_at.strftime('%Y-%m-%d')}"
#                     task_details.append(f"'{task.title}' ({status}){date_str}")

#                 task_list_str = "; ".join(task_details)
#                 ai_response_content = f"You have {len(user_tasks)} tasks: {task_list_str}"
#             else:
#                 ai_response_content = "You don't have any tasks yet."

#         except Exception as e:
#             ai_response_content = f"Sorry, I couldn't retrieve your tasks: {str(e)}"

#     # Handle task editing commands
#     elif any(keyword in user_message_lower for keyword in ["edit", "update", "change"]) and any(keyword in user_message_lower for keyword in ["task", "todo"]):
#         # Check if we're in the middle of an editing process
#         if any("what would you like to update" in msg.content.lower() for msg in conversation_history[-3:]):
#             # We're in an editing flow, determine what to update based on this message
#             # For simplicity, we'll implement basic field detection
#             user_tasks = get_tasks_by_user(session, user_id)

#             # Find a recently mentioned task
#             target_task = None
#             for prev_msg in reversed(conversation_history[-5:]):
#                 if "task '" in prev_msg.content:
#                     for task in user_tasks:
#                         if task.title in prev_msg.content:
#                             target_task = task
#                             break
#                     if target_task:
#                         break

#             if target_task:
#                 # Determine what field to update based on the message content
#                 updated_fields = []

#                 # Check for status updates
#                 if any(word in user_message_lower for word in ["complete", "done", "finished", "yes", "true"]):
#                     # Mark task as complete
#                     updated_task = mark_task_complete(session, str(target_task.id), True, user_id)
#                     if updated_task:
#                         updated_fields.append(f"status set to completed")

#                 elif any(word in user_message_lower for word in ["pending", "not done", "incomplete", "no", "false"]):
#                     # Mark task as incomplete
#                     updated_task = mark_task_complete(session, str(target_task.id), False, user_id)
#                     if updated_task:
#                         updated_fields.append(f"status set to pending")

#                 # Check for title updates
#                 title_match = re.search(r"(?:name|title)\s*(?:to|is|be)\s*(.+?)(?:\s|$|[.!?])", user_message, re.IGNORECASE)
#                 if title_match:
#                     new_title = title_match.group(1).strip().strip('"\'').strip()
#                     task_update = TaskUpdate(title=new_title)
#                     updated_task = update_task(session, str(target_task.id), task_update, user_id)
#                     if updated_task:
#                         updated_fields.append(f"title changed to '{new_title}'")

#                 # Check for description updates
#                 desc_match = re.search(r"(?:description|desc)\s*(?:to|is|be)\s*(.+?)(?:\s|$|[.!?])", user_message, re.IGNORECASE)
#                 if desc_match:
#                     new_desc = desc_match.group(1).strip().strip('"\'').strip()
#                     task_update = TaskUpdate(description=new_desc)
#                     updated_task = update_task(session, str(target_task.id), task_update, user_id)
#                     if updated_task:
#                         updated_fields.append(f"description updated")

#                 if updated_fields:
#                     ai_response_content = f"Updated {target_task.title}: {', '.join(updated_fields)}."
#                 else:
#                     ai_response_content = f"I couldn't identify what to update in task '{target_task.title}'. Please specify what field to update (name, description, status)."
#             else:
#                 ai_response_content = "I couldn't identify which task to edit. Which task would you like to update?"
#         else:
#             # Extract task name to edit
#             edit_match = re.search(r"(?:edit|update|change)\s+(?:task|todo)\s+(.+?)(?:\s|$|[.!?])", user_message, re.IGNORECASE)
#             if edit_match:
#                 task_name = edit_match.group(1).strip().strip('"\'').strip()

#                 # Find the task
#                 user_tasks = get_tasks_by_user(session, user_id)
#                 matching_task = None
#                 for task in user_tasks:
#                     if task_name.lower() in task.title.lower() or task.title.lower() in task_name.lower():
#                         matching_task = task
#                         break

#                 if matching_task:
#                     ai_response_content = f"I found the task '{matching_task.title}'. What would you like to update? You can change the name, description, or status (completed/pending)."
#                 else:
#                     ai_response_content = f"I couldn't find a task named '{task_name}'. Here are your tasks: {[task.title for task in user_tasks]}"
#             else:
#                 # Ask for which task to edit
#                 user_tasks = get_tasks_by_user(session, user_id)
#                 ai_response_content = f"Which task would you like to edit? You have: {[task.title for task in user_tasks] if user_tasks else 'no tasks'}."

#     # Handle task deletion commands
#     elif any(keyword in user_message_lower for keyword in ["delete", "remove", "cancel"]) and any(keyword in user_message_lower for keyword in ["task", "todo"]):
#         # Extract task name to delete
#         delete_match = re.search(r"(?:delete|remove|cancel)\s+(?:task|todo)\s+(.+?)(?:\s|$|[.!?])", user_message, re.IGNORECASE)
#         if delete_match:
#             task_name = delete_match.group(1).strip().strip('"\'').strip()

#             # Find the task
#             user_tasks = get_tasks_by_user(session, user_id)
#             matching_task = None
#             for task in user_tasks:
#                 if task_name.lower() in task.title.lower() or task.title.lower() in task_name.lower():
#                     matching_task = task
#                     break

#             if matching_task:
#                 # Delete the task
#                 success = delete_task(session, str(matching_task.id), user_id)
#                 if success:
#                     ai_response_content = f"The task '{matching_task.title}' has been deleted successfully."
#                 else:
#                     ai_response_content = f"Sorry, I couldn't delete the task '{matching_task.title}'."
#             else:
#                 ai_response_content = f"I couldn't find a task named '{task_name}'."
#         else:
#             # Ask for which task to delete
#             user_tasks = get_tasks_by_user(session, user_id)
#             ai_response_content = f"Which task would you like to delete? You have: {[task.title for task in user_tasks] if user_tasks else 'no tasks'}."

#     # Handle other commands if none of the above matched
#     # Only run the default AI response if we haven't already set a specific response
#     if not ai_response_content:
#         # For other messages, just return the AI response without task operations
#         ai_response_content = ai_agent.run_sync(final_input)

#     # Store AI response with potential tool results
#     ai_message_record = create_message(
#         session=session,
#         conversation_id=conversation_id,
#         role="assistant",
#         content=ai_response_content,
#         metadata={"tool_results": tool_results}
#     )

#     # ✅ Return structured response
#     return {
#         "conversation_id": conversation_id,
#         "response": ai_response_content,
#         "tool_calls": [],  # Will be populated when we have proper tool calling
#         "tool_results": tool_results,
#         "timestamp": ai_message_record.timestamp.isoformat()
#     }

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import Dict, Any, Optional, List
import re
from datetime import datetime

from ..database.database import get_session
from ..models.user import User
from ..models.conversation import MessageCreate, Conversation
from ..models.task import TaskCreate, TaskUpdate, Task  # assuming Task is your SQLModel
from ..services.auth import get_current_user
from ..services.conversation_service import (
    create_conversation,
    get_conversation,
    create_message,
    get_conversation_messages
)
from ..services.task_service import (
    create_task,
    get_tasks_by_user,
    get_task_by_id,
    update_task,
    delete_task,
    mark_task_complete
)
from ..ai import ai_agent  # your AI wrapper (sync call assumed)

router = APIRouter(prefix="/api/{user_id}", tags=["chat"])


# ────────────────────────────────────────────────
#  Helper functions – better intent & entity extraction
# ────────────────────────────────────────────────

def extract_task_title(text: str) -> Optional[str]:
    """Extract task title from natural language input"""
    text_lower = text.lower().strip()

    # Common patterns users actually type
    patterns = [
        r"(?:add|create|new|make)\s+(?:a|an|the)?\s*(?:task|todo|reminder)?\s*(?:called|named|for|to)?\s*[:\"']?([^\"'\.!?\n]+?)(?:\"|'|\.|!|\?|$|\n)",
        r"(?:add|create)\s+[\"']?([^\"']+?)[\"']?\s+(?:to|in|as|on|for|my)\s+(?:task|tasks|todo|list|todos)",
        r"(?:task|todo|reminder)[:\s=-]+(.+?)(?:\s|$|[.!?])",
        r"^(?:please\s+)?(?:add|create|put)\s+(.+?)(?:\s+to\s+my\s+(?:task|todo|list))?$",
        r"(.+?)\s+(?:to|in|on|for)\s+my\s+(?:task|todo|list|todos)",
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            title = match.group(1).strip().strip('"\'').strip()
            if len(title) >= 2 and title.lower() not in {"a", "an", "the", "to", "for", "with"}:
                return title

    # Very last fallback: everything after first action verb
    action_verbs = ["add", "create", "make", "new", "put", "schedule", "remind"]
    for verb in action_verbs:
        if verb in text_lower:
            parts = text_lower.split(verb, 1)
            if len(parts) > 1:
                candidate = parts[1].strip().removeprefix("a ").removeprefix("an ").strip()
                if candidate and len(candidate) > 1:
                    return candidate.capitalize()

    return None


def find_best_task_match(tasks: List[Task], query: str) -> Optional[Task]:
    """Find the most likely task the user is referring to"""
    if not tasks:
        return None

    query_lower = query.lower().strip()

    # 1. Exact match (most reliable)
    for task in tasks:
        if task.title.lower() == query_lower:
            return task

    # 2. Starts with (very common)
    for task in tasks:
        if task.title.lower().startswith(query_lower):
            return task

    # 3. Contains – prefer shorter / more exact titles
    candidates = [t for t in tasks if query_lower in t.title.lower()]
    if candidates:
        return min(candidates, key=lambda t: (len(t.title), -t.created_at.timestamp()))

    return None


# ────────────────────────────────────────────────
#  Main chat endpoint
# ────────────────────────────────────────────────

@router.post("/chat")
def chat_endpoint(
    user_id: str,
    message_request: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Security check
    if str(current_user.id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user's chat"
        )

    user_message = message_request.get("message", "").strip()
    if not user_message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message is required"
        )

    conversation_id = message_request.get("conversation_id")

    # Get or create conversation
    if conversation_id:
        conversation = get_conversation(session, conversation_id, user_id)
        if not conversation:
            raise HTTPException(404, "Conversation not found or doesn't belong to user")
    else:
        conversation = create_conversation(session, user_id)
        conversation_id = str(conversation.id)

    # Save user's message
    create_message(
        session=session,
        conversation_id=conversation_id,
        role="user",
        content=user_message,
        metadata={"type": "user_input"}
    )

    # Load recent history (for context)
    history = get_conversation_messages(session, conversation_id)
    history_text = "\n".join(f"{m.role}: {m.content}" for m in history[:-1])

    user_msg_lower = user_message.lower()
    response_text = ""
    tool_results = []

    # Load user's current tasks once
    user_tasks = get_tasks_by_user(session, user_id)

    # ──── Intent detection (rule-based for reliability) ─────

    # 1. CREATE / ADD TASK
    if any(kw in user_msg_lower for kw in ["add", "create", "new", "make"]) and \
       any(kw in user_msg_lower for kw in ["task", "todo", "reminder", "item"]):

        title = extract_task_title(user_message)

        if not title:
            response_text = "Got it! What should I name the task? (example: Buy groceries, Call mom, Finish report)"
        else:
            new_task = create_task(
                session,
                TaskCreate(title=title.strip(), description=""),
                user_id
            )
            tool_results.append({
                "tool": "create_task",
                "success": True,
                "task_id": str(new_task.id),
                "title": title
            })
            response_text = (
                f"✅ Task **{title}** created!\n"
                "Want to add more details?\n"
                "• description\n"
                "• due date\n"
                "• priority\n"
                "...or just say 'done' / 'no' / skip"
            )

    # 2. LIST / SHOW / VIEW tasks
    elif any(kw in user_msg_lower for kw in ["list", "show", "view", "see", "what", "my", "all"]) and \
         any(kw in user_msg_lower for kw in ["task", "tasks", "todo", "todos", "list"]):

        if not user_tasks:
            response_text = "You don't have any tasks yet. Want to create one?"
        else:
            lines = []
            for i, task in enumerate(user_tasks, 1):
                status_emoji = "✓" if task.completed else "⬜"
                due = ""
                if hasattr(task, "due_date") and task.due_date:
                    due = f"  • due {task.due_date:%b %d, %Y}"
                lines.append(f"{i}. {status_emoji} {task.title}{due}")
            response_text = "Your tasks:\n" + "\n".join(lines)

    # 3. DELETE / REMOVE task
    elif any(kw in user_msg_lower for kw in ["delete", "remove", "cancel", "clear", "trash"]) and \
         any(kw in user_msg_lower for kw in ["task", "tasks", "todo", "item"]):

        title_hint = extract_task_title(user_message) or user_message
        target_task = find_best_task_match(user_tasks, title_hint)

        if not target_task:
            if user_tasks:
                response_text = f"Which one? Your tasks: {', '.join(t.title for t in user_tasks)}"
            else:
                response_text = "You don't have any tasks to delete."
        else:
            success = delete_task(session, str(target_task.id), user_id)
            if success:
                response_text = f"🗑️ Task **{target_task.title}** deleted."
            else:
                response_text = "Sorry, couldn't delete the task right now."

    # 4. COMPLETE / MARK DONE
    elif any(kw in user_msg_lower for kw in ["complete", "done", "finish", "mark", "checked", "ticked"]):

        title_hint = extract_task_title(user_message) or user_message
        target_task = find_best_task_match(user_tasks, title_hint)

        if not target_task:
            if user_tasks:
                response_text = f"Which task? You have: {', '.join(t.title for t in user_tasks)}"
            else:
                response_text = "No tasks to mark complete yet."
        else:
            updated = mark_task_complete(session, str(target_task.id), True, user_id)
            if updated:
                response_text = f"🎉 **{target_task.title}** marked as done!"
            else:
                response_text = "Couldn't update the task status."

    # 5. EDIT / UPDATE / CHANGE (basic – more complex edits go to AI)
    elif any(kw in user_msg_lower for kw in ["edit", "update", "change", "modify", "rename"]):

        title_hint = extract_task_title(user_message) or user_message
        target_task = find_best_task_match(user_tasks, title_hint)

        if not target_task:
            if user_tasks:
                response_text = f"Which task to edit? You have: {', '.join(t.title for t in user_tasks)}"
            else:
                response_text = "No tasks to edit yet."
        else:
            response_text = (
                f"Okay, editing **{target_task.title}**.\n"
                "What would you like to change?\n"
                "• name / title\n"
                "• description\n"
                "• due date\n"
                "• priority\n"
                "...just tell me what to update"
            )

    # ──── Fallback: let the AI handle everything else ─────
    if not response_text:
        prompt = f"""You are a helpful, concise task manager assistant.
Current date: {datetime.now().strftime("%Y-%m-%d")}

Recent conversation:
{history_text}

User: {user_message}

Respond naturally and help manage tasks."""
        
        response_text = ai_agent.run_sync(prompt)

    # Save assistant's reply
    create_message(
        session=session,
        conversation_id=conversation_id,
        role="assistant",
        content=response_text,
        metadata={"tool_results": tool_results}
    )

    # Return response to frontend
    return {
        "conversation_id": conversation_id,
        "response": response_text,
        "tool_calls": [],
        "tool_results": tool_results,
        "timestamp": datetime.utcnow().isoformat()
    }
