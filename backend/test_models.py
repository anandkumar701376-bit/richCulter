from app.db.base import Base


print("Registered tables:")

for table_name in Base.metadata.tables:
    print(f"- {table_name}")