-- Not necessary for final project
-- PRAGMA foreign_keys = ON;
-- BEGIN TRANSACTION;
-- /*don't forget to 'COMMIT;' afterwards if there are no errors*/

DROP TABLE IF EXISTS remCat;
DROP TABLE IF EXISTS remPer;
DROP TABLE IF EXISTS perCat;
DROP TABLE IF EXISTS Relationships;
DROP TABLE IF EXISTS RelationshipType;
DROP TABLE IF EXISTS NotedPerson;
DROP TABLE IF EXISTS NotePhoto;
DROP TABLE IF EXISTS SocialLinks;
DROP TABLE IF EXISTS Reminders;
DROP TABLE IF EXISTS SocialType;
DROP TABLE IF EXISTS Notes;
DROP TABLE IF EXISTS Person;
DROP TABLE IF EXISTS Category;
DROP TABLE IF EXISTS Photo;

CREATE TABLE Photo (
  photokey   INTEGER PRIMARY KEY,
  filePath   TEXT NOT NULL,
  caption    TEXT
);

CREATE TABLE Notes (
  notekey       INTEGER PRIMARY KEY,
  title         TEXT NOT NULL,
  content       TEXT,
  dateCreated   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  lastModified  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE SocialType (
  socialkey     INTEGER PRIMARY KEY,
  platformName  TEXT NOT NULL UNIQUE,
  platformURL   TEXT
);

CREATE TABLE RelationshipType (
  relTypeKey INTEGER PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE Category (
  catkey      INTEGER PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE Person (
  perkey     INTEGER PRIMARY KEY,
  photokey   INTEGER,
  firstName  TEXT NOT NULL,
  lastName   TEXT NOT NULL,
  birthday   TEXT,
  location   TEXT,
  FOREIGN KEY (photokey) REFERENCES Photo(photokey)
    ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE SocialLinks (
  socialkey   INTEGER NOT NULL,
  perkey      INTEGER NOT NULL,
  handle      TEXT NOT NULL,
  profileURL  TEXT,
  PRIMARY KEY (socialkey, perkey),
  FOREIGN KEY (socialkey) REFERENCES SocialType(socialkey)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (perkey) REFERENCES Person(perkey)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE NotePhoto (
  notekey   INTEGER NOT NULL,
  photokey  INTEGER NOT NULL,
  PRIMARY KEY (notekey, photokey),
  FOREIGN KEY (notekey) REFERENCES Notes(notekey)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (photokey) REFERENCES Photo(photokey)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE NotedPerson (
  perkey   INTEGER NOT NULL,
  notekey  INTEGER NOT NULL,
  PRIMARY KEY (perkey, notekey),
  FOREIGN KEY (perkey) REFERENCES Person(perkey)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (notekey) REFERENCES Notes(notekey)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Relationships (
  relTypeKey INTEGER NOT NULL,
  perkey1    INTEGER NOT NULL,
  perkey2    INTEGER NOT NULL,
  startDate  TEXT,
  PRIMARY KEY (perkey1, perkey2),
  CHECK (perkey1 < perkey2),
  FOREIGN KEY (relTypeKey) REFERENCES RelationshipType(relTypeKey)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (perkey1) REFERENCES Person(perkey)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (perkey2) REFERENCES Person(perkey)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Reminders (
  remkey          INTEGER PRIMARY KEY,
  title           TEXT NOT NULL,
  description     TEXT,
  dueDate         TEXT,
  completed       INTEGER NOT NULL DEFAULT 0,
  lastContactDate TEXT
);

CREATE TABLE perCat (
  perkey  INTEGER NOT NULL,
  catkey  INTEGER NOT NULL,
  PRIMARY KEY (perkey, catkey),
  FOREIGN KEY (perkey) REFERENCES Person(perkey)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (catkey) REFERENCES Category(catkey)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE remPer (
  remkey INTEGER NOT NULL,
  perkey INTEGER NOT NULL,
  PRIMARY KEY (remkey, perkey),
  FOREIGN KEY (remkey) REFERENCES Reminders(remkey)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (perkey) REFERENCES Person(perkey)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE remCat (
  remkey INTEGER NOT NULL,
  catkey INTEGER NOT NULL,
  PRIMARY KEY (remkey, catkey),
  FOREIGN KEY (remkey) REFERENCES Reminders(remkey)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (catkey) REFERENCES Category(catkey)
    ON UPDATE CASCADE ON DELETE RESTRICT
);
