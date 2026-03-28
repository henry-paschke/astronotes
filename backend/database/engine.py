from sqlmodel import SQLModel, Session, create_engine
from database.models import User, Transcript

DATABASE_URL = (
    "postgresql+psycopg2://stibnyblog:si4rcn-Jp43gFkb"
    "@ksu-backend-server.postgres.database.azure.com:5432/astronotes"
    "?sslmode=require"
)

engine = create_engine(DATABASE_URL, echo=True)

SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
