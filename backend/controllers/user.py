from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlmodel import Session, select

from database.engine import get_session
from database.models import User
from utilities.auth import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)

user_router = APIRouter(prefix="/api", tags=["users"])


# ── Schemas ────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str


class Token(BaseModel):
    access_token: str
    token_type: str


# ── Endpoints ──────────────────────────────────────────────────────────────────

@user_router.post(
    "/users",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
def create_user(body: UserCreate, db: Session = Depends(get_session)):
    if db.exec(select(User).where(User.username == body.username)).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already taken",
        )
    user = User(username=body.username, password=hash_password(body.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserOut(id=user.id, username=user.username)


@user_router.post(
    "/auth/token",
    response_model=Token,
    summary="Obtain a JWT access token",
)
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_session),
):
    user = db.exec(select(User).where(User.username == form.username)).first()
    if not user or not verify_password(form.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return Token(
        access_token=create_access_token(subject=user.username),
        token_type="bearer",
    )


@user_router.get(
    "/users/me",
    response_model=UserOut,
    summary="Get the currently authenticated user",
)
def get_me(current_user: User = Depends(get_current_user)):
    return UserOut(id=current_user.id, username=current_user.username)
