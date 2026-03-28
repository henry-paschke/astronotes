from sqlmodel import SQLModel, create_engine

engine = create_engine(DATABASE_URL, echo=True)

SQLModel.metadata.create_all(engine)
