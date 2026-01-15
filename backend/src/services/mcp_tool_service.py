from typing import Dict, Any, Optional
from sqlmodel import Session
from ..models.task import TaskCreate, TaskUpdate
from ..services.task_service import (
    create_task, get_tasks_by_user, get_task_by_id,
    update_task, delete_task, mark_task_complete
)
from ..models.user import User

class MCPTaskTools:
    def __init__(self, session: Session):
        self.session = session

    def add_task(self, title: str, description: Optional[str] = None, user_id: str = None) -> Dict[str, Any]:
        """
        Add a new task for the user
        """
        try:
            # Create a TaskCreate object
            task_create = TaskCreate(title=title, description=description)

            # Create the task using the existing service
            new_task = create_task(self.session, task_create, user_id)

            return {
                "success": True,
                "task_id": str(new_task.id),
                "message": f"Task '{title}' added successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to add task: {str(e)}"
            }

    def list_tasks(self, user_id: str, filter_type: str = "all") -> Dict[str, Any]:
        """
        List tasks for the user with optional filtering
        """
        try:
            # Get tasks using the existing service
            tasks = get_tasks_by_user(self.session, user_id)

            # Apply filter if specified
            if filter_type == "active":
                tasks = [task for task in tasks if not task.completed]
            elif filter_type == "completed":
                tasks = [task for task in tasks if task.completed]
            # For "all", return all tasks (no filter needed)

            # Format the tasks for response
            formatted_tasks = []
            for task in tasks:
                formatted_tasks.append({
                    "id": str(task.id),
                    "title": task.title,
                    "description": task.description,
                    "completed": task.completed,
                    "created_at": task.created_at.isoformat() if task.created_at else None,
                    "completed_at": task.completed_at.isoformat() if task.completed_at else None
                })

            return {
                "success": True,
                "tasks": formatted_tasks,
                "total_count": len(formatted_tasks),
                "message": f"Found {len(formatted_tasks)} tasks"
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to list tasks: {str(e)}"
            }

    def update_task(self, task_id: str, user_id: str, title: Optional[str] = None,
                   description: Optional[str] = None, completed: Optional[bool] = None) -> Dict[str, Any]:
        """
        Update an existing task
        """
        try:
            # Check if task exists and belongs to user
            existing_task = get_task_by_id(self.session, task_id, user_id)
            if not existing_task:
                return {
                    "success": False,
                    "message": f"Task with ID {task_id} not found or doesn't belong to user"
                }

            # Create update object with provided fields
            update_data = {}
            if title is not None:
                update_data['title'] = title
            if description is not None:
                update_data['description'] = description
            if completed is not None:
                update_data['completed'] = completed

            task_update = TaskUpdate(**update_data)

            # Update the task using the existing service
            updated_task = update_task(self.session, task_id, task_update, user_id)

            if updated_task:
                return {
                    "success": True,
                    "message": f"Task '{updated_task.title}' updated successfully"
                }
            else:
                return {
                    "success": False,
                    "message": "Failed to update task"
                }
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to update task: {str(e)}"
            }

    def delete_task(self, task_id: str, user_id: str) -> Dict[str, Any]:
        """
        Delete a task
        """
        try:
            # Check if task exists and belongs to user
            existing_task = get_task_by_id(self.session, task_id, user_id)
            if not existing_task:
                return {
                    "success": False,
                    "message": f"Task with ID {task_id} not found or doesn't belong to user"
                }

            # Delete the task using the existing service
            success = delete_task(self.session, task_id, user_id)

            if success:
                return {
                    "success": True,
                    "message": f"Task '{existing_task.title}' deleted successfully"
                }
            else:
                return {
                    "success": False,
                    "message": "Failed to delete task"
                }
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to delete task: {str(e)}"
            }

    def complete_task(self, task_id: str, completed: bool, user_id: str) -> Dict[str, Any]:
        """
        Mark a task as completed or not completed
        """
        try:
            # Check if task exists and belongs to user
            existing_task = get_task_by_id(self.session, task_id, user_id)
            if not existing_task:
                return {
                    "success": False,
                    "message": f"Task with ID {task_id} not found or doesn't belong to user"
                }

            # Mark task as complete/incomplete using the existing service
            updated_task = mark_task_complete(self.session, task_id, completed, user_id)

            if updated_task:
                status = "completed" if completed else "marked as not completed"
                return {
                    "success": True,
                    "message": f"Task '{updated_task.title}' {status} successfully"
                }
            else:
                return {
                    "success": False,
                    "message": "Failed to update task completion status"
                }
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to update task completion: {str(e)}"
            }

# Tool definitions for AI agent
def get_mcp_tools():
    """
    Return the tool definitions for the AI agent to use
    """
    return [
        {
            "type": "function",
            "function": {
                "name": "add_task",
                "description": "Add a new task for the user",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "title": {
                            "type": "string",
                            "description": "The title of the task"
                        },
                        "description": {
                            "type": "string",
                            "description": "Optional description of the task"
                        }
                    },
                    "required": ["title"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "list_tasks",
                "description": "List tasks for the user with optional filtering",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "filter_type": {
                            "type": "string",
                            "enum": ["all", "active", "completed"],
                            "description": "Filter type for tasks: 'all', 'active', or 'completed'",
                            "default": "all"
                        }
                    }
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "update_task",
                "description": "Update an existing task",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "task_id": {
                            "type": "string",
                            "description": "The ID of the task to update"
                        },
                        "title": {
                            "type": "string",
                            "description": "New title for the task (optional)"
                        },
                        "description": {
                            "type": "string",
                            "description": "New description for the task (optional)"
                        },
                        "completed": {
                            "type": "boolean",
                            "description": "Whether the task is completed (optional)"
                        }
                    },
                    "required": ["task_id"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "delete_task",
                "description": "Delete a task",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "task_id": {
                            "type": "string",
                            "description": "The ID of the task to delete"
                        }
                    },
                    "required": ["task_id"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "complete_task",
                "description": "Mark a task as completed or not completed",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "task_id": {
                            "type": "string",
                            "description": "The ID of the task to update"
                        },
                        "completed": {
                            "type": "boolean",
                            "description": "Whether the task should be marked as completed"
                        }
                    },
                    "required": ["task_id", "completed"]
                }
            }
        }
    ]