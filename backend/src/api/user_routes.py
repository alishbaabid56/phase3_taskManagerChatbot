from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from ..database.database import get_session
from ..models.user import User, UserCreate, UserRead
from ..services.user_service import create_user, get_user_by_email
from ..services.auth import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=UserRead)
def create_new_user(user_create: UserCreate, session: Session = Depends(get_session)):
    existing_user = get_user_by_email(session, user_create.email)
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = create_user(session, user_create)
    return user

@router.get("/me", response_model=UserRead)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
