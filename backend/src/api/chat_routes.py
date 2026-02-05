from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import Dict, Any, Optional, List
import re
from datetime import datetime

from ..database.database import get_session
from ..models.user import User
from ..models.conversation import MessageCreate, Conversation
from ..models.task import TaskCreate, TaskUpdate, Task
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
from ..ai import ai_agent

router = APIRouter(prefix="/api/{user_id}", tags=["chat"])


# ────────────────────────────────────────────────
#  Helper functions
# ────────────────────────────────────────────────

def extract_task_title(text: str) -> Optional[str]:
    text_lower = text.lower().strip()
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

    action_verbs = ["add", "create", "make", "new", "put", "schedule", "remind", "update", "change", "rename"]
    for verb in action_verbs:
        if verb in text_lower:
            parts = text_lower.split(verb, 1)
            if len(parts) > 1:
                candidate = parts[1].strip().removeprefix("a ").removeprefix("an ").removeprefix("task ").removeprefix("todo ").strip()
                if candidate and len(candidate) > 1:
                    return candidate.capitalize()
    return None


def find_best_task_match(tasks: List[Task], query: str) -> Optional[Task]:
    if not tasks:
        return None
    query_lower = query.lower().strip()
    for task in tasks:
        if task.title.lower() == query_lower:
            return task
    for task in tasks:
        if task.title.lower().startswith(query_lower):
            return task
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
    if str(current_user.id) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    user_message = message_request.get("message", "").strip()
    if not user_message:
        raise HTTPException(status_code=400, detail="Message is required")

    conversation_id = message_request.get("conversation_id")
    if conversation_id:
        conversation = get_conversation(session, conversation_id, user_id)
        if not conversation:
            raise HTTPException(404, "Conversation not found")
    else:
        conversation = create_conversation(session, user_id)
        conversation_id = str(conversation.id)

    create_message(
        session=session,
        conversation_id=conversation_id,
        role="user",
        content=user_message,
        metadata={"type": "user_input"}
    )

    history = get_conversation_messages(session, conversation_id)
    history_text = "\n".join(f"{m.role}: {m.content}" for m in history[:-1])

    user_msg_lower = user_message.lower()
    response_text = ""
    tool_results = []

    user_tasks = get_tasks_by_user(session, user_id)

    # 1. CREATE TASK
    if any(kw in user_msg_lower for kw in ["add", "create", "new", "make"]) and \
       any(kw in user_msg_lower for kw in ["task", "todo", "reminder", "item"]):

        title = extract_task_title(user_message)
        if not title:
            response_text = "Task ka naam kya rakhna hai? (misal: Buy groceries)"
        else:
            new_task = create_task(session, TaskCreate(title=title.strip(), description=""), user_id)
            tool_results.append({"tool": "create_task", "success": True, "task_id": str(new_task.id), "title": title})
            response_text = f"✅ Task **{title}** bana diya!\nDescription add karna chahti ho?\n• yes → likh do\n• no / done / skip"

    # 2. LIST / VIEW TASKS
    elif any(kw in user_msg_lower for kw in ["list", "show", "view", "see", "my", "all"]) and \
         any(kw in user_msg_lower for kw in ["task", "tasks", "todo", "todos"]):

        if not user_tasks:
            response_text = "Abhi koi task nahi hai. Banayein?"
        else:
            lines = [f"{i}. {'✓' if t.completed else '⬜'} {t.title}" for i, t in enumerate(user_tasks, 1)]
            response_text = "Aapke tasks:\n" + "\n".join(lines)

    # 3. DELETE TASK
    elif any(kw in user_msg_lower for kw in ["delete", "remove", "cancel", "trash"]) and \
         any(kw in user_msg_lower for kw in ["task", "todo"]):

        title_hint = extract_task_title(user_message) or user_message
        target = find_best_task_match(user_tasks, title_hint)
        if not target:
            response_text = f"Kaunsa task delete karna hai? Tasks: {', '.join(t.title for t in user_tasks)}" if user_tasks else "Delete karne ke liye task nahi hai."
        else:
            if delete_task(session, str(target.id), user_id):
                response_text = f"🗑️ **{target.title}** delete ho gaya."
            else:
                response_text = "Task delete nahi ho saka."

    # 4. MARK COMPLETE (agar "to" ho to skip — rename se confusion na ho)
    elif any(kw in user_msg_lower for kw in ["complete", "done", "finish", "mark", "checked", "✔", "ho gaya"]) \
         and "to" not in user_msg_lower:

        title_hint = extract_task_title(user_message) or re.sub(r'(mark|as|done|complete|finish)\s*', '', user_message, flags=re.I).strip()
        target = find_best_task_match(user_tasks, title_hint)
        if not target:
            response_text = f"Kaunsa task complete karna hai? Tasks: {', '.join(t.title for t in user_tasks)}" if user_tasks else "Koi task nahi hai."
        else:
            if mark_task_complete(session, str(target.id), True, user_id):
                response_text = f"🎉 **{target.title}** complete ho gaya!"
            else:
                response_text = "Complete mark nahi ho saka."

    # 5. EDIT / RENAME / UPDATE — ab yeh block sabse sahi rename karega
    elif any(kw in user_msg_lower for kw in ["edit", "update", "change", "rename", "correct", "modify"]):

        # Sabse behtar rename pattern (ab purana part sahi capture hoga)
        rename_pattern = r"(?:update|change|rename|edit|correct|modify)\s+(?:task|todo)?\s*(?:[\"']?(.+?)[\"']?\s*)?(?:to|into|as|become)\s+(.+?)(?:\s*$|[.!?])"
        match = re.search(rename_pattern, user_message, re.IGNORECASE | re.DOTALL)

        if match:
            old_part_raw = match.group(1)
            new_title_raw = match.group(2)

            old_part = (old_part_raw or "").strip().strip('"\'').strip()
            new_title = (new_title_raw or "").strip().strip('"\'').strip()

            if not new_title:
                response_text = "Naya naam kya rakhna hai?"
            else:
                # Agar old_part nahi diya to purane message se guess karo
                if not old_part:
                    # "to newname" part hata ke search karo
                    search_text = re.sub(r'(to|into|as|become)\s+.+?$', '', user_message, flags=re.I).strip()
                else:
                    search_text = old_part

                target = find_best_task_match(user_tasks, search_text)

                if not target:
                    response_text = f"'{search_text}' se milta task nahi mila."
                else:
                    if new_title.lower() == target.title.lower():
                        response_text = f"**{target.title}** ka naam pehle se hi **{new_title}** hai."
                    else:
                        updated = update_task(session, str(target.id), TaskUpdate(title=new_title), user_id)
                        if updated:
                            response_text = f"Task renamed: **{target.title}** → **{new_title}**"
                        else:
                            response_text = "Rename nahi ho saka (database issue)."
        else:
            # Normal edit (rename pattern nahi mila)
            title_hint = extract_task_title(user_message) or user_message
            target = find_best_task_match(user_tasks, title_hint)
            if not target:
                response_text = f"Kaunsa task edit karna hai? Tasks: {', '.join(t.title for t in user_tasks)}" if user_tasks else "Koi task nahi hai."
            else:
                response_text = f"**{target.title}** edit kar rahi ho — kya change karna hai?\n• naam (rename to ...)\n• description\n• due date"

    # Fallback to AI
    if not response_text:
        prompt = f"""You are a helpful task manager bot.
Current date: {datetime.now().strftime("%Y-%m-%d")}

Recent chat:
{history_text}

User: {user_message}

Rules:
- Sirf tab complete mark karo jab user clearly kahe "done", "complete", "mark as done", "finish" etc.
- Agar "update X to Y" ya "change X to Y" likha hai to rename samjho, complete mat karo.
- Jawab short aur clear rakho.
- Confusion ho to pooch lo."""
        
        response_text = ai_agent.run_sync(prompt)

    create_message(
        session=session,
        conversation_id=conversation_id,
        role="assistant",
        content=response_text,
        metadata={"tool_results": tool_results}
    )

    return {
        "conversation_id": conversation_id,
        "response": response_text,
        "tool_calls": [],
        "tool_results": tool_results,
        "timestamp": datetime.utcnow().isoformat()
    }