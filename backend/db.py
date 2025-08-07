from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker
from passlib.context import CryptContext

DATABASE_URL = "sqlite:///./data.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user")  # 'admin' | 'user'
    is_active = Column(Boolean, default=True)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def ensure_admin():
    """Cria o usuário admin:admin se ainda não existir."""
    db = SessionLocal()
    try:
        from sqlalchemy.orm import Session
        from sqlalchemy import select
        stmt = select(User).where(User.username == "admin")
        user = db.execute(stmt).scalar_one_or_none()
        if not user:
            admin = User(
                username="admin",
                hashed_password=get_password_hash("admin"),
                role="admin",
                is_active=True,
            )
            db.add(admin)
            db.commit()
    finally:
        db.close()
