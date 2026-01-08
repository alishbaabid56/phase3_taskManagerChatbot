from sqlmodel import Session, select
from passlib.context import CryptContext
from typing import Optional
from src.models.user import User, UserCreate
import hashlib

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_user(session: Session, user_create: UserCreate) -> User:
    """
    Create a new user with hashed password.
    Reference: @specs/database/schema.md
    """
    # Validate password length before hashing (bcrypt limitation)
    password_bytes = user_create.password.encode('utf-8')
    if len(password_bytes) > 72:
        raise ValueError('Password must be 72 bytes or less')

    # Hash the password
    hashed_password = get_password_hash(user_create.password)

    # Create user object
    user = User(
        email=user_create.email,
        password_hash=hashed_password
    )

    # Add to session and commit
    session.add(user)
    session.commit()
    session.refresh(user)

    return user

def authenticate_user(session: Session, email: str, password: str) -> Optional[User]:
    """
    Authenticate a user by email and password.
    Reference: @specs/database/schema.md
    """
    # Find user by email
    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()

    # Verify password if user exists
    if user and verify_password(password, user.password_hash):
        return user

    return None

def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt.
    Reference: @specs/database/schema.md
    """
    # Bcrypt has a 72-byte password length limit
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        # Truncate to 72 bytes while preserving the original string as much as possible
        password = password_bytes[:72].decode('utf-8', errors='ignore')

    try:
        return pwd_context.hash(password)
    except Exception as e:
        error_str = str(e)
        # Handle bcrypt library issues or password length issues
        if "module 'bcrypt' has no attribute '__about__'" in error_str or "error reading bcrypt version" in error_str:
            # If bcrypt is having installation/compatibility issues, use a simple hash approach for development
            # Note: This is less secure and should only be used for development
            import warnings
            warnings.warn("Using fallback hashing due to bcrypt issues - not secure for production")
            return hashlib.sha256(password.encode()).hexdigest()
        elif "password cannot be longer than 72 bytes" in error_str:
            # Truncate to 72 characters as a fallback, but if bcrypt still has issues, use SHA256
            truncated_password = password[:72]
            try:
                return pwd_context.hash(truncated_password)
            except:
                # If bcrypt still fails, use SHA256 fallback
                import warnings
                warnings.warn("Using fallback hashing due to bcrypt issues - not secure for production")
                return hashlib.sha256(truncated_password.encode()).hexdigest()
        else:
            raise e

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.
    Reference: @specs/database/schema.md
    """
    # Check if the stored hash is a SHA256 hash (64 hex characters)
    # This happens when bcrypt fails and we use fallback hashing
    if len(hashed_password) == 64 and all(c in '0123456789abcdef' for c in hashed_password.lower()):
        # Compare with SHA256 fallback
        return hashed_password == hashlib.sha256(plain_password.encode()).hexdigest()

    # Otherwise, try to use bcrypt for verification
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        # If bcrypt fails for other reasons, raise the error
        raise e

def get_user_by_email(session: Session, email: str) -> Optional[User]:
    """
    Get a user by their email address.
    Reference: @specs/database/schema.md
    """
    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()
    return user