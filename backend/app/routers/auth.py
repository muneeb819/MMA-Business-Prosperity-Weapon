from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.models.database import get_db, Base, engine
from sqlalchemy import Column, String, Boolean, DateTime, Float
from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
import os, uuid

SECRET_KEY = os.getenv("JWT_SECRET", "mbpw-dev-secret-change-in-prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)

class UserModel(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, default="user")
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    avatar_url = Column(String, default="")

class SessionModel(Base):
    __tablename__ = "sessions"
    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False)
    token = Column(String, nullable=False)
    device = Column(String, default="")
    ip_address = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)

class AuditLogModel(Base):
    __tablename__ = "audit_logs"
    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False)
    action = Column(String, nullable=False)
    resource = Column(String, default="")
    resource_id = Column(String, default="")
    details = Column(String, default="")
    ip_address = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    name: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    is_active: bool
    avatar_url: str
    last_login: str | None

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    return user

def require_role(min_role: str = "admin"):
    async def role_checker(current_user: UserModel = Depends(get_current_user)):
        role_levels = {"user": 0, "admin": 1, "superadmin": 2}
        if role_levels.get(current_user.role, 0) < role_levels.get(min_role, 1):
            raise HTTPException(status_code=403, detail=f"Requires {min_role} role or higher")
        return current_user
    return role_checker

def get_optional_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        user = db.query(UserModel).filter(UserModel.id == user_id).first()
        return user if user and user.is_active else None
    except JWTError:
        return None

@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(UserModel).filter(UserModel.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = UserModel(
        id=str(uuid.uuid4()),
        email=req.email,
        name=req.name,
        hashed_password=pwd_context.hash(req.password),
        role="user",
        created_at=datetime.utcnow(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    session = SessionModel(
        id=str(uuid.uuid4()), user_id=user.id, token=token,
        expires_at=datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    db.add(session)
    db.commit()
    return TokenResponse(access_token=token, user={
        "id": user.id, "email": user.email, "name": user.name,
        "role": user.role, "is_active": user.is_active,
        "avatar_url": user.avatar_url, "last_login": None,
    })

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.email == req.email).first()
    if not user or not pwd_context.verify(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user.last_login = datetime.utcnow()
    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    session = SessionModel(
        id=str(uuid.uuid4()), user_id=user.id, token=token,
        expires_at=datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    db.add(session)
    db.commit()
    return TokenResponse(access_token=token, user={
        "id": user.id, "email": user.email, "name": user.name,
        "role": user.role, "is_active": user.is_active,
        "avatar_url": user.avatar_url, "last_login": user.last_login.isoformat() if user.last_login else None,
    })

@router.get("/me", response_model=UserResponse)
def get_me(user: UserModel = Depends(get_current_user)):
    return UserResponse(
        id=user.id, email=user.email, name=user.name,
        role=user.role, is_active=user.is_active,
        avatar_url=user.avatar_url,
        last_login=user.last_login.isoformat() if user.last_login else None,
    )

@router.post("/logout")
def logout(user: UserModel = Depends(get_current_user), credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    db.query(SessionModel).filter(SessionModel.token == credentials.credentials).update({"is_active": False})
    db.commit()
    return {"message": "Logged out"}

@router.get("/sessions")
def get_sessions(user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    sessions = db.query(SessionModel).filter(
        SessionModel.user_id == user.id, SessionModel.is_active == True
    ).all()
    return [{"id": s.id, "device": s.device, "ip_address": s.ip_address, "created_at": s.created_at.isoformat(), "expires_at": s.expires_at.isoformat()} for s in sessions]

@router.delete("/sessions/{session_id}")
def revoke_session(session_id: str, user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id, SessionModel.user_id == user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.is_active = False
    db.commit()
    return {"message": "Session revoked"}

@router.get("/audit-log")
def get_audit_log(user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role not in ("admin", "superadmin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    logs = db.query(AuditLogModel).order_by(AuditLogModel.created_at.desc()).limit(100).all()
    return [{"id": l.id, "user_id": l.user_id, "action": l.action, "resource": l.resource, "resource_id": l.resource_id, "details": l.details, "created_at": l.created_at.isoformat()} for l in logs]

@router.post("/audit-log")
def create_audit_log(action: str, resource: str = "", resource_id: str = "", details: str = "", ip: str = "", user: UserModel | None = Depends(get_optional_user), db: Session = Depends(get_db)):
    log = AuditLogModel(
        id=str(uuid.uuid4()), user_id=user.id if user else "anonymous",
        action=action, resource=resource, resource_id=resource_id,
        details=details, ip_address=ip, created_at=datetime.utcnow(),
    )
    db.add(log)
    db.commit()
    return {"message": "Logged"}
