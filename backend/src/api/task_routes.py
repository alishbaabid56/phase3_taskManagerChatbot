from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List
from ..database.database import get_session
from ..models.task import Task, TaskCreate, TaskUpdate, TaskRead
from ..models.user import User
from ..services.task_service import (
    create_task, get_tasks_by_user, get_task_by_id,
    update_task, delete_task, mark_task_complete
)
from ..services.auth import get_current_user

router = APIRouter(prefix="/api/{user_id}/tasks", tags=["tasks"])

@router.get("/", response_model=List[TaskRead])
def read_tasks(user_id: str, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if str(current_user.id) != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return get_tasks_by_user(session, user_id)

@router.post("/", response_model=TaskRead)
def create_task_endpoint(user_id: str, task_create: TaskCreate, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if str(current_user.id) != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return create_task(session, task_create, user_id)

@router.get("/{task_id}", response_model=TaskRead)
def read_task(user_id: str, task_id: str, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if str(current_user.id) != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    task = get_task_by_id(session, task_id, user_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task

@router.put("/{task_id}", response_model=TaskRead)
def update_task_endpoint(user_id: str, task_id: str, task_update: TaskUpdate, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if str(current_user.id) != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    task = update_task(session, task_id, task_update, user_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task

@router.delete("/{task_id}")
def delete_task_endpoint(user_id: str, task_id: str, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if str(current_user.id) != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    success = delete_task(session, task_id, user_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return {"message": "Task deleted successfully"}

@router.patch("/{task_id}/complete", response_model=TaskRead)
def update_task_completion(user_id: str, task_id: str, completed: bool, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if str(current_user.id) != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    task = mark_task_complete(session, task_id, completed, user_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task
