from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_admin import Admin, BaseView, expose
from flask_admin.contrib.sqla import ModelView
from sqlalchemy import event
from sqlalchemy.engine import Engine
import sqlite3
import os

app = Flask(__name__)
CORS(app)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.sqlite"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

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

# class UserView(ModelView):
#     column_hide_backrefs = False
#     column_list = ["id", "username", "name", "hosted_games", "games", "drawing", "votes"]

# admin = Admin(app)
# admin.add_view(UserView(User, db.session))

if __name__ == "__main__":
    with app.app_context():
        if not os.path.exists("instance/app.sqlite"):
            print("creating new database...")
            create_database()

    app.run(debug=True)