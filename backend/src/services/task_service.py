from sqlmodel import Session, select
from typing import List, Optional
from src.models.task import Task, TaskCreate, TaskUpdate
from src.models.user import User

def create_task(session: Session, task_create: TaskCreate, user_id: str) -> Task:
    """
    Create a new task for a specific user.
    Reference: @specs/database/schema.md
    """
    task = Task(
        title=task_create.title,
        description=task_create.description,
        completed=task_create.completed,
        user_id=user_id
    )

    session.add(task)
    session.commit()
    session.refresh(task)

    return task

def get_tasks_by_user(session: Session, user_id: str) -> List[Task]:
    """
    Get all tasks for a specific user.
    Reference: @specs/database/schema.md
    """
    statement = select(Task).where(Task.user_id == user_id)
    tasks = session.exec(statement).all()
    return tasks

def get_task_by_id(session: Session, task_id: str, user_id: str) -> Optional[Task]:
    """
    Get a specific task by its ID for a specific user (enforces user isolation).
    Reference: @specs/database/schema.md
    """
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    task = session.exec(statement).first()
    return task

def update_task(session: Session, task_id: str, task_update: TaskUpdate, user_id: str) -> Optional[Task]:
    """
    Update a specific task for a specific user.
    Reference: @specs/database/schema.md
    """
    task = get_task_by_id(session, task_id, user_id)
    if not task:
        return None

    # Update fields that were provided
    if task_update.title is not None:
        task.title = task_update.title
    if task_update.description is not None:
        task.description = task_update.description
    if task_update.completed is not None:
        task.completed = task_update.completed

    session.add(task)
    session.commit()
    session.refresh(task)

    return task

def delete_task(session: Session, task_id: str, user_id: str) -> bool:
    """
    Delete a specific task for a specific user.
    Reference: @specs/database/schema.md
    """
    task = get_task_by_id(session, task_id, user_id)
    if not task:
        return False

    session.delete(task)
    session.commit()
    return True

def mark_task_complete(session: Session, task_id: str, completed: bool, user_id: str) -> Optional[Task]:
    """
    Mark a specific task as complete or incomplete for a specific user.
    Reference: @specs/database/schema.md
    """
    task = get_task_by_id(session, task_id, user_id)
    if not task:
        return None

    task.completed = completed

    session.add(task)
    session.commit()
    session.refresh(task)

    return task