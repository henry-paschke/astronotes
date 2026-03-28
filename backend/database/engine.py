from sqlmodel import SQLModel, Session, create_engine
from database.models import User, Transcript
from config import DATABASE_URL

engine = create_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True,  # test connection before use, discard if stale
    pool_recycle=1800,  # recycle connections after 30 min (Azure timeout)
)

SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
