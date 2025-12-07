from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import CheckConstraint, text
from sqlalchemy.sql import func

db = SQLAlchemy()

class Photo(db.Model):
    __tablename__ = "Photo"

    photokey = db.Column(db.Integer, primary_key=True)
    filePath = db.Column(db.String, nullable=False)
    caption = db.Column(db.String, nullable=True)

    # optional backref targets
    people = db.relationship("Person", back_populates="photo", passive_deletes=True)
    note_photos = db.relationship("NotePhoto", back_populates="photo", passive_deletes=True)

    def __repr__(self):
        return f"<Photo {self.photokey}>"


class Notes(db.Model):
    __tablename__ = "Notes"

    notekey = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    content = db.Column(db.String, nullable=True)
    # TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    dateCreated = db.Column(
        db.String,
        nullable=False,
        server_default=func.current_timestamp(),
    )
    lastModified = db.Column(
        db.String,
        nullable=False,
        server_default=func.current_timestamp(),
    )

    note_photos = db.relationship("NotePhoto", back_populates="note", passive_deletes=True)
    noted_people = db.relationship("NotedPerson", back_populates="note", passive_deletes=True)

    def __repr__(self):
        return f"<Notes {self.notekey} '{self.title}'>"


class SocialType(db.Model):
    __tablename__ = "SocialType"

    socialkey = db.Column(db.Integer, primary_key=True)
    platformName = db.Column(db.String, nullable=False, unique=True)
    platformURL = db.Column(db.String, nullable=True)

    links = db.relationship("SocialLinks", back_populates="social_type", passive_deletes=True)

    def __repr__(self):
        return f"<SocialType {self.socialkey} '{self.platformName}'>"


class RelationshipType(db.Model):
    __tablename__ = "RelationshipType"

    relTypeKey = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False, unique=True)
    description = db.Column(db.String, nullable=True)

    relationships = db.relationship("Relationships", back_populates="rel_type", passive_deletes=True)

    def __repr__(self):
        return f"<RelationshipType {self.relTypeKey} '{self.name}'>"


class Category(db.Model):
    __tablename__ = "Category"

    catkey = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False, unique=True)
    description = db.Column(db.String, nullable=True)

    per_cats = db.relationship("PerCat", back_populates="category", passive_deletes=True)
    rem_cats = db.relationship("RemCat", back_populates="category", passive_deletes=True)

    def __repr__(self):
        return f"<Category {self.catkey} '{self.name}'>"


class Person(db.Model):
    __tablename__ = "Person"

    perkey = db.Column(db.Integer, primary_key=True)
    photokey = db.Column(
        db.Integer,
        db.ForeignKey("Photo.photokey", onupdate="CASCADE", ondelete="SET NULL"),
        nullable=True,
    )
    firstName = db.Column(db.String, nullable=False)
    lastName = db.Column(db.String, nullable=False)
    birthday = db.Column(db.String, nullable=True)  # TEXT in schema
    location = db.Column(db.String, nullable=True)

    photo = db.relationship("Photo", back_populates="people")

    social_links = db.relationship("SocialLinks", back_populates="person", passive_deletes=True)
    noted_person_entries = db.relationship("NotedPerson", back_populates="person", passive_deletes=True)
    per_cats = db.relationship("PerCat", back_populates="person", passive_deletes=True)
    rem_pers = db.relationship("RemPer", back_populates="person", passive_deletes=True)

    rels_as_first = db.relationship(
        "Relationships",
        foreign_keys="Relationships.perkey1",
        back_populates="person1",
        passive_deletes=True,
    )
    rels_as_second = db.relationship(
        "Relationships",
        foreign_keys="Relationships.perkey2",
        back_populates="person2",
        passive_deletes=True,
    )

    def __repr__(self):
        return f"<Person {self.perkey} {self.firstName} {self.lastName}>"


class SocialLinks(db.Model):
    __tablename__ = "SocialLinks"

    socialkey = db.Column(
        db.Integer,
        db.ForeignKey("SocialType.socialkey", onupdate="CASCADE", ondelete="RESTRICT"),
        primary_key=True,
    )
    perkey = db.Column(
        db.Integer,
        db.ForeignKey("Person.perkey", onupdate="CASCADE", ondelete="CASCADE"),
        primary_key=True,
    )
    handle = db.Column(db.String, nullable=False)
    profileURL = db.Column(db.String, nullable=True)

    social_type = db.relationship("SocialType", back_populates="links")
    person = db.relationship("Person", back_populates="social_links")

    def __repr__(self):
        return f"<SocialLinks social={self.socialkey} per={self.perkey}>"


class NotePhoto(db.Model):
    __tablename__ = "NotePhoto"

    notekey = db.Column(
        db.Integer,
        db.ForeignKey("Notes.notekey", onupdate="CASCADE", ondelete="CASCADE"),
        primary_key=True,
    )
    photokey = db.Column(
        db.Integer,
        db.ForeignKey("Photo.photokey", onupdate="CASCADE", ondelete="CASCADE"),
        primary_key=True,
    )

    note = db.relationship("Notes", back_populates="note_photos")
    photo = db.relationship("Photo", back_populates="note_photos")

    def __repr__(self):
        return f"<NotePhoto note={self.notekey} photo={self.photokey}>"


class NotedPerson(db.Model):
    __tablename__ = "NotedPerson"

    perkey = db.Column(
        db.Integer,
        db.ForeignKey("Person.perkey", onupdate="CASCADE", ondelete="CASCADE"),
        primary_key=True,
    )
    notekey = db.Column(
        db.Integer,
        db.ForeignKey("Notes.notekey", onupdate="CASCADE", ondelete="CASCADE"),
        primary_key=True,
    )

    person = db.relationship("Person", back_populates="noted_person_entries")
    note = db.relationship("Notes", back_populates="noted_people")

    def __repr__(self):
        return f"<NotedPerson per={self.perkey} note={self.notekey}>"


class Relationships(db.Model):
    __tablename__ = "Relationships"

    relTypeKey = db.Column(
        db.Integer,
        db.ForeignKey("RelationshipType.relTypeKey", onupdate="CASCADE", ondelete="RESTRICT"),
        nullable=False,
    )
    perkey1 = db.Column(
        db.Integer,
        db.ForeignKey("Person.perkey", onupdate="CASCADE", ondelete="CASCADE"),
        primary_key=True,
    )
    perkey2 = db.Column(
        db.Integer,
        db.ForeignKey("Person.perkey", onupdate="CASCADE", ondelete="CASCADE"),
        primary_key=True,
    )
    startDate = db.Column(db.String, nullable=True)

    __table_args__ = (
        CheckConstraint("perkey1 < perkey2", name="ck_relationships_perkey_order"),
    )

    rel_type = db.relationship("RelationshipType", back_populates="relationships")
    person1 = db.relationship("Person", foreign_keys=[perkey1], back_populates="rels_as_first")
    person2 = db.relationship("Person", foreign_keys=[perkey2], back_populates="rels_as_second")

    def __repr__(self):
        return f"<Relationships {self.perkey1}-{self.perkey2} type={self.relTypeKey}>"


class Reminders(db.Model):
    __tablename__ = "Reminders"

    remkey = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=True)
    dueDate = db.Column(db.String, nullable=True)
    # INTEGER NOT NULL DEFAULT 0
    completed = db.Column(
        db.Boolean,
        nullable=False,
        server_default=text("0"),
    )
    lastContactDate = db.Column(db.String, nullable=True)

    rem_pers = db.relationship("RemPer", back_populates="reminder", passive_deletes=True)
    rem_cats = db.relationship("RemCat", back_populates="reminder", passive_deletes=True)

    def __repr__(self):
        return f"<Reminders {self.remkey} '{self.title}'>"


class PerCat(db.Model):
    __tablename__ = "perCat"

    perkey = db.Column(
        db.Integer,
        db.ForeignKey("Person.perkey", onupdate="CASCADE", ondelete="CASCADE"),
        primary_key=True,
    )
    catkey = db.Column(
        db.Integer,
        db.ForeignKey("Category.catkey", onupdate="CASCADE", ondelete="RESTRICT"),
        primary_key=True,
    )

    person = db.relationship("Person", back_populates="per_cats")
    category = db.relationship("Category", back_populates="per_cats")

    def __repr__(self):
        return f"<PerCat per={self.perkey} cat={self.catkey}>"


class RemPer(db.Model):
    __tablename__ = "remPer"

    remkey = db.Column(
        db.Integer,
        db.ForeignKey("Reminders.remkey", onupdate="CASCADE", ondelete="CASCADE"),
        primary_key=True,
    )
    perkey = db.Column(
        db.Integer,
        db.ForeignKey("Person.perkey", onupdate="CASCADE", ondelete="CASCADE"),
        primary_key=True,
    )

    reminder = db.relationship("Reminders", back_populates="rem_pers")
    person = db.relationship("Person", back_populates="rem_pers")

    def __repr__(self):
        return f"<RemPer rem={self.remkey} per={self.perkey}>"


class RemCat(db.Model):
    __tablename__ = "remCat"

    remkey = db.Column(
        db.Integer,
        db.ForeignKey("Reminders.remkey", onupdate="CASCADE", ondelete="CASCADE"),
        primary_key=True,
    )
    catkey = db.Column(
        db.Integer,
        db.ForeignKey("Category.catkey", onupdate="CASCADE", ondelete="RESTRICT"),
        primary_key=True,
    )

    reminder = db.relationship("Reminders", back_populates="rem_cats")
    category = db.relationship("Category", back_populates="rem_cats")

    def __repr__(self):
        return f"<RemCat rem={self.remkey} cat={self.catkey}>"