from flask import Flask
from flask_cors import CORS
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from sqlalchemy import event
from sqlalchemy.engine import Engine
import sqlite3
import os

app = Flask(__name__)
CORS(app)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.sqlite"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# import ORM models from models.py
from ORM_models import db, Photo, Notes, SocialType, RelationshipType, Category, Person, SocialLinks, NotePhoto, NotedPerson, Relationships, Reminders, PerCat, RemPer, RemCat
db.init_app(app)

# ensures foreign keys are enforced for ALL database connections
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if isinstance(dbapi_connection, sqlite3.Connection):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys = ON;")
        cursor.close()

def create_database():
    path = os.path.join(os.path.dirname(__file__), "..", "Project 2 - schema", "create_schema.sql")
    
    with open(path, "r", encoding="utf-8") as f:
        schema_sql = f.read()

    conn = db.engine.raw_connection()
    try:
        conn.executescript(schema_sql)
        conn.commit()
    finally:
        conn.close()

# create views from flask-admin
class PhotoView(ModelView):
    column_hide_backrefs = False
    column_list = ["photokey", "filePath"]
class NotesView(ModelView):
    column_hide_backrefs = False
    column_list = ["notekey", "title", "content", "dateCreated", "lastModified"]
class SocialTypeView(ModelView):
    column_hide_backrefs = False
    column_list = ["socialkey", "platformName", "platformURL"]
class RelationshipTypeView(ModelView):
    column_hide_backrefs = False
    column_list = ["relTypeKey", "name", "description"]
class CategoryView(ModelView):
    column_hide_backrefs = False
    column_list = ["catkey", "name", "description"]
class PersonView(ModelView):
    column_hide_backrefs = False
    column_list = [
        "perkey",
        "firstName",
        "lastName",
        "birthday",
        "location",
    ]
class SocialLinksView(ModelView):
    column_hide_backrefs = False
    column_list = [
        "socialkey",
        "perkey",
        "handle",
        "profileURL",
    ]
class NotePhotoView(ModelView):
    column_hide_backrefs = False
    column_list = [
        "notekey",
        "photokey",
    ]
class NotedPersonView(ModelView):
    column_hide_backrefs = False
    column_list = [
        "perkey",
        "notekey",
    ]
class RelationshipsView(ModelView):
    column_hide_backrefs = False
    column_list = [
        "relTypeKey",
        "perkey1",
        "perkey2",
    ]
class RemindersView(ModelView):
    column_hide_backrefs = False
    column_list = [
        "remkey",
        "title",
        "description",
        "dueDate",
        "completed",
    ]
class PerCatView(ModelView):
    column_hide_backrefs = False
    column_list = [
        "perkey",
        "catkey",
    ]
class RemPerView(ModelView):
    column_hide_backrefs = False
    column_list = ["remkey", "perkey",]
class RemCatView(ModelView):
    column_hide_backrefs = False
    column_list = ["remkey", "catkey",]

admin = Admin(app)
admin.add_view(PhotoView(Photo, db.session))
admin.add_view(NotesView(Notes, db.session))
admin.add_view(SocialTypeView(SocialType, db.session))
admin.add_view(RelationshipTypeView(RelationshipType, db.session))
admin.add_view(CategoryView(Category, db.session))
admin.add_view(PersonView(Person, db.session))
admin.add_view(SocialLinksView(SocialLinks, db.session))
admin.add_view(NotePhotoView(NotePhoto, db.session))
admin.add_view(NotedPersonView(NotedPerson, db.session))
admin.add_view(RelationshipsView(Relationships, db.session))
admin.add_view(RemindersView(Reminders, db.session))
admin.add_view(PerCatView(PerCat, db.session))
admin.add_view(RemPerView(RemPer, db.session))
admin.add_view(RemCatView(RemCat, db.session))

if __name__ == "__main__":
    with app.app_context():
        if not os.path.exists("instance/app.sqlite"):
            print("creating new database...")
            create_database()

    app.run(debug=True)