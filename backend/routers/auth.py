from datetime import datetime, timedelta
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.db import User, get_db, verify_password, get_password_hash

# Config JWT (para uso local)
SECRET_KEY = "local-dev-secret-change-me"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")
router = APIRouter(prefix="/auth", tags=["auth"]) 

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class UserOut(BaseModel):
    id: int
    username: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "user"


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    from sqlalchemy import select
    stmt = select(User).where(User.username == username)
    return db.execute(stmt).scalar_one_or_none()


def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        role: str = payload.get("role", "user")
        token_data = TokenData(username=username, role=role)
    except JWTError:
        raise credentials_exception
    user = get_user_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

async def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso restrito ao administrador")
    return current_user

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Usuário ou senha incorretos")
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# Gestão de usuários (admin)
@router.get("/users", response_model=List[UserOut])
async def list_users(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    from sqlalchemy import select
    stmt = select(User)
    return [u for (u,) in db.execute(stmt).all()] if hasattr(db.execute(stmt), 'all') else db.execute(stmt).scalars().all()

@router.post("/users", response_model=UserOut)
async def create_user(user_in: UserCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    if get_user_by_username(db, user_in.username):
        raise HTTPException(status_code=400, detail="Usuário já existe")
    user = User(
        username=user_in.username,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    db.delete(user)
    db.commit()
    return {"ok": True}
