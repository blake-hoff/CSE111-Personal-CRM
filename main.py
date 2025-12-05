from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy import event
from sqlalchemy.engine import Engine
import sqlite3

app = Flask(__name__)
CORS(app)

# --- Config ---
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///example.sqlite"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# --- Enable SQLite foreign key enforcement ---
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if isinstance(dbapi_connection, sqlite3.Connection):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys = ON;")
        cursor.close()

# =========================================================
# Models
# =========================================================

# Photo
class Photo(db.Model):
    __tablename__ = 'Photo'

    photokey = db.Column(db.Integer, primary_key=True)
    filePath = db.Column(db.String, nullable=False)
    caption = db.Column(db.String, nullable=True)

    # Optional reverse relation (no delete-orphan; FK uses SET NULL)
    people = db.relationship('Person', back_populates='photo', passive_deletes=True)


# Notes
class Notes(db.Model):
    __tablename__ = 'Notes'

    notekey = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    content = db.Column(db.String, nullable=True)
    dateCreated = db.Column(db.String, nullable=False, server_default=func.current_timestamp())
    lastModified = db.Column(db.String, nullable=False, server_default=func.current_timestamp())

    photos = db.relationship('NotePhoto', back_populates='note', passive_deletes=True)
    persons = db.relationship('NotedPerson', back_populates='note', passive_deletes=True)


# SocialType
class SocialType(db.Model):
    __tablename__ = 'SocialType'

    socialkey = db.Column(db.Integer, primary_key=True)
    platformName = db.Column(db.String, nullable=False, unique=True)
    platformURL = db.Column(db.String, nullable=True)

    links = db.relationship('SocialLinks', back_populates='social_type', passive_deletes=True)


# RelationshipType
class RelationshipType(db.Model):
    __tablename__ = 'RelationshipType'

    relTypeKey = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False, unique=True)
    description = db.Column(db.String, nullable=True)

    relationships = db.relationship('Relationships', back_populates='rel_type', passive_deletes=True)


# Category
class Category(db.Model):
    __tablename__ = 'Category'

    catkey = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False, unique=True)
    description = db.Column(db.String, nullable=True)

    persons = db.relationship('PerCat', back_populates='category', passive_deletes=True)
    reminders = db.relationship('RemCat', back_populates='category', passive_deletes=True)


# Person
class Person(db.Model):
    __tablename__ = 'Person'

    perkey = db.Column(db.Integer, primary_key=True)

    photokey = db.Column(
        db.Integer,
        db.ForeignKey('Photo.photokey', onupdate='CASCADE', ondelete='SET NULL'),
        nullable=True
    )
    firstName = db.Column(db.String, nullable=False)
    lastName = db.Column(db.String, nullable=False)
    birthday = db.Column(db.String, nullable=True)
    location = db.Column(db.String, nullable=True)

    photo = db.relationship('Photo', back_populates='people')

    social_links = db.relationship('SocialLinks', back_populates='person', passive_deletes=True)
    notes = db.relationship('NotedPerson', back_populates='person', passive_deletes=True)
    categories = db.relationship('PerCat', back_populates='person', passive_deletes=True)
    reminders = db.relationship('RemPer', back_populates='person', passive_deletes=True)

    rels_as_first = db.relationship('Relationships', foreign_keys='Relationships.perkey1',
                                    back_populates='person1', passive_deletes=True)
    rels_as_second = db.relationship('Relationships', foreign_keys='Relationships.perkey2',
                                     back_populates='person2', passive_deletes=True)


# SocialLinks (association)
class SocialLinks(db.Model):
    __tablename__ = 'SocialLinks'

    socialkey = db.Column(
        db.Integer,
        db.ForeignKey('SocialType.socialkey', onupdate='CASCADE', ondelete='RESTRICT'),
        primary_key=True
    )
    perkey = db.Column(
        db.Integer,
        db.ForeignKey('Person.perkey', onupdate='CASCADE', ondelete='CASCADE'),
        primary_key=True
    )
    handle = db.Column(db.String, nullable=False)
    profileURL = db.Column(db.String, nullable=True)

    social_type = db.relationship('SocialType', back_populates='links')
    person = db.relationship('Person', back_populates='social_links')


# NotePhoto (association)
class NotePhoto(db.Model):
    __tablename__ = 'NotePhoto'

    notekey = db.Column(
        db.Integer,
        db.ForeignKey('Notes.notekey', onupdate='CASCADE', ondelete='CASCADE'),
        primary_key=True
    )
    photokey = db.Column(
        db.Integer,
        db.ForeignKey('Photo.photokey', onupdate='CASCADE', ondelete='CASCADE'),
        primary_key=True
    )

    note = db.relationship('Notes', back_populates='photos')
    photo = db.relationship('Photo')


# NotedPerson (association)
class NotedPerson(db.Model):
    __tablename__ = 'NotedPerson'

    perkey = db.Column(
        db.Integer,
        db.ForeignKey('Person.perkey', onupdate='CASCADE', ondelete='CASCADE'),
        primary_key=True
    )
    notekey = db.Column(
        db.Integer,
        db.ForeignKey('Notes.notekey', onupdate='CASCADE', ondelete='CASCADE'),
        primary_key=True
    )

    person = db.relationship('Person', back_populates='notes')
    note = db.relationship('Notes', back_populates='persons')


# Relationships (association with CHECK)
class Relationships(db.Model):
    __tablename__ = 'Relationships'

    relTypeKey = db.Column(
        db.Integer,
        db.ForeignKey('RelationshipType.relTypeKey', onupdate='CASCADE', ondelete='RESTRICT'),
        nullable=False
    )
    perkey1 = db.Column(
        db.Integer,
        db.ForeignKey('Person.perkey', onupdate='CASCADE', ondelete='CASCADE'),
        primary_key=True
    )
    perkey2 = db.Column(
        db.Integer,
        db.ForeignKey('Person.perkey', onupdate='CASCADE', ondelete='CASCADE'),
        primary_key=True
    )
    startDate = db.Column(db.String, nullable=True)

    __table_args__ = (
        CheckConstraint('perkey1 < perkey2', name='ck_relationships_perkey_order'),
    )

    rel_type = db.relationship('RelationshipType', back_populates='relationships')
    person1 = db.relationship('Person', foreign_keys=[perkey1], back_populates='rels_as_first')
    person2 = db.relationship('Person', foreign_keys=[perkey2], back_populates='rels_as_second')


# Reminders
class Reminders(db.Model):
    __tablename__ = 'Reminders'

    remkey = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=True)
    dueDate = db.Column(db.String, nullable=True)
    completed = db.Column(db.Boolean, nullable=False, server_default=db.text('0'))
    lastContactDate = db.Column(db.String, nullable=True)

    persons = db.relationship('RemPer', back_populates='reminder', passive_deletes=True)
    categories = db.relationship('RemCat', back_populates='reminder', passive_deletes=True)


# perCat (association)
class PerCat(db.Model):
    __tablename__ = 'perCat'

    perkey = db.Column(
        db.Integer,
        db.ForeignKey('Person.perkey', onupdate='CASCADE', ondelete='CASCADE'),
        primary_key=True
    )
    catkey = db.Column(
        db.Integer,
        db.ForeignKey('Category.catkey', onupdate='CASCADE', ondelete='RESTRICT'),
        primary_key=True
    )

    person = db.relationship('Person', back_populates='categories')
    category = db.relationship('Category', back_populates='persons')


# remPer (association)
class RemPer(db.Model):
    __tablename__ = 'remPer'

    remkey = db.Column(
        db.Integer,
        db.ForeignKey('Reminders.remkey', onupdate='CASCADE', ondelete='CASCADE'),
        primary_key=True
    )
    perkey = db.Column(
        db.Integer,
        db.ForeignKey('Person.perkey', onupdate='CASCADE', ondelete='CASCADE'),
        primary_key=True
    )

    reminder = db.relationship('Reminders', back_populates='persons')
    person = db.relationship('Person', back_populates='reminders')


# remCat (association)
class RemCat(db.Model):
    __tablename__ = 'remCat'

    remkey = db.Column(
        db.Integer,
        db.ForeignKey('Reminders.remkey', onupdate='CASCADE', ondelete='CASCADE'),
        primary_key=True
    )
    catkey = db.Column(
        db.Integer,
        db.ForeignKey('Category.catkey', onupdate='CASCADE', ondelete='RESTRICT'),
        primary_key=True
    )

    reminder = db.relationship('Reminders', back_populates='categories')
    category = db.relationship('Category', back_populates='reminders')


# --- bootstrap (optional) ---
with app.app_context():
    db.create_all()

@app.route('/')
def basePage():
    return 'Student Grades App by Blake Hoff'

@app.route('/api/insert')
def createUser():

    return 'insert into the database'

if __name__ == "__main__":
    app.run(debug=True)