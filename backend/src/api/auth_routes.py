from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlmodel import Session, select
from datetime import timedelta

from src.database.database import get_session
from src.models.user import User, UserCreate, UserRead
from src.services.user_service import create_user, authenticate_user
from src.services.auth import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=UserRead)
def register(
    user_create: UserCreate,
    session: Session = Depends(get_session)
):
    # ✅ SQLModel correct way (session.query ❌)
    statement = select(User).where(User.email == user_create.email)
    existing_user = session.exec(statement).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    user = create_user(session, user_create)
    return user


@router.post("/login")
def login(
    email: str = Form(...),
    password: str = Form(...),
    session: Session = Depends(get_session)
):
    user = authenticate_user(session, email, password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
