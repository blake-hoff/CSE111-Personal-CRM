PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

DELETE FROM remCat;
DELETE FROM remPer;
DELETE FROM perCat;
DELETE FROM Relationships;
DELETE FROM NotedPerson;
DELETE FROM NotePhoto;
DELETE FROM SocialLinks;
DELETE FROM Reminders;
DELETE FROM Person;
DELETE FROM Category;
DELETE FROM RelationshipType;
DELETE FROM SocialType;
DELETE FROM Notes;
DELETE FROM Photo;

COMMIT;

.mode list
.separator "|"

-- Parent tables first
.import data/photo.tbl Photo
.import data/notes.tbl Notes
.import data/socialtype.tbl SocialType
.import data/relationshiptype.tbl RelationshipType
.import data/category.tbl Category
.import data/person.tbl Person
.import data/reminders.tbl Reminders

-- Child / link tables
.import data/sociallinks.tbl SocialLinks
.import data/notephoto.tbl NotePhoto
.import data/notedperson.tbl NotedPerson
.import data/relationships.tbl Relationships
.import data/percat.tbl perCat
.import data/remper.tbl remPer
.import data/remcat.tbl remCat