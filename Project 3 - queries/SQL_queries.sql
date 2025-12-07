PRAGMA foreign_keys = ON;

-- =========================================================
-- Notes
-- =========================================================

-- Q1 — Insert a new note
-- English: "Insert a new note"
-- Params: (title, content)
INSERT INTO Notes (title, content)
VALUES (?, ?);


-- Q2 — Attach a photo to an existing note
-- English: "Create a new note photo regarding an already created note"
-- Params: (notekey, photokey)
INSERT INTO NotePhoto (notekey, photokey)
VALUES (?, ?);


-- Optional helper: Insert a Photo
-- English: "Insert Photo (helper)"
-- Params: (filePath, caption)
INSERT INTO Photo (filePath, caption)
VALUES (?, ?);


-- Q3 — Notes involving a given person
-- English: "Search for all notes involving this person"
-- Params: (firstName, lastName)
SELECT n.notekey,
       n.title,
       n.content,
       n.dateCreated,
       n.lastModified
FROM Person pe
JOIN NotedPerson np ON np.perkey = pe.perkey
JOIN Notes n        ON n.notekey = np.notekey
WHERE LOWER(pe.firstName) = LOWER(?)
  AND LOWER(pe.lastName)  = LOWER(?)
ORDER BY n.dateCreated DESC;


-- Q4 — Update a note (append text)
-- English: "Update a note"
-- Params: (appendText, notekey)
UPDATE Notes
SET content      = COALESCE(content, '') || CHAR(10) || ?,
    lastModified = CURRENT_TIMESTAMP
WHERE notekey = ?;


-- Q5 — Delete a note
-- English: "DELETE note"
-- Params: (notekey)
DELETE FROM Notes
WHERE notekey = ?;



-- =========================================================
-- Person
-- =========================================================

-- Q6 — Create a new person
-- English: "Create new person (firstName, lastName, birthday, location)"
-- Params: (photokey NULLABLE, firstName, lastName, birthday YYYY-MM-DD, location)
INSERT INTO Person (photokey, firstName, lastName, birthday, location)
VALUES (?, ?, ?, ?, ?);


-- Q7 — Update a person's information
-- English: "Update a person's information"
-- Params: (newFirstName, newLastName, newBirthday, newLocation, newPhotoKey, personKey)
UPDATE Person
SET firstName = COALESCE(?, firstName),
    lastName  = COALESCE(?, lastName),
    birthday  = COALESCE(?, birthday),
    location  = COALESCE(?, location),
    photokey  = COALESCE(?, photokey)
WHERE perkey = ?;


-- Q8 — List all people (contact list)
-- English: "Search for all people that are in your CRM to populate the contact list"
SELECT perkey,
       firstName,
       lastName,
       birthday,
       location
FROM Person
ORDER BY lastName, firstName;


-- Q9 — People matching criteria {birthday month, relationship type, location like}
-- English: "Search for people that meet a certain criteria {birthday, relationship, location}"
-- Params: (birthMonthOrNull, birthMonthCopy, relTypeNameOrNull, relTypeNameCopy, locationLikeOrNull, locationLikeCopy)
SELECT DISTINCT p.perkey,
       p.firstName,
       p.lastName,
       p.birthday,
       p.location
FROM Person p
LEFT JOIN Relationships r  ON r.perkey1 = p.perkey OR r.perkey2 = p.perkey
LEFT JOIN RelationshipType rt ON rt.relTypeKey = r.relTypeKey
WHERE (? IS NULL OR strftime('%m', p.birthday) = printf('%02d', ?))
  AND (? IS NULL OR rt.name = ?)
  AND (? IS NULL OR p.location LIKE ?)
ORDER BY p.lastName, p.firstName;


-- Q10 — Delete a person
-- English: "Delete person"
-- Params: (personKeyToDelete)
DELETE FROM Person
WHERE perkey = ?;



-- =========================================================
-- SocialType and SocialLinks
-- =========================================================

-- Q11 — Create a new social network
-- English: "Create new social network {platformName, platformURL}"
-- Params: (platformName, platformURL)
INSERT INTO SocialType (platformName, platformURL)
VALUES (?, ?);


-- Q12 — Delete a social network
-- English: "Delete a social network {socialType}"
-- Params: (platformNameToDelete)
DELETE FROM SocialType
WHERE platformName = ?;


-- Q13 — Create a social link
-- English: "Create Social link regarding a certain person in your CRM"
-- Params: (socialkey, perkey, handle, profileURL)
INSERT INTO SocialLinks (socialkey, perkey, handle, profileURL)
VALUES (?, ?, ?, ?);


-- Q14 — Update a social link
-- English: "Update social link for someone in your CRM"
-- Params: (newHandle, newProfileURL, socialkey, perkey)
UPDATE SocialLinks
SET handle     = COALESCE(?, handle),
    profileURL = COALESCE(?, profileURL)
WHERE socialkey = ?
  AND perkey    = ?;



-- =========================================================
-- RelationshipType and Relationships
-- =========================================================

-- Q15 — Create a relationship (store once with perkey1 < perkey2)
-- English: "Create a relationship with two people {perkey1, perkey2, startDate}"
-- Params in order:
--   relTypeKey,
--   personA, personB, personA, personB,  -- perkey1
--   personA, personB, personA, personB,  -- perkey2
--   startDate
INSERT OR IGNORE INTO Relationships (relTypeKey, perkey1, perkey2, startDate)
VALUES (
  ?,
  CASE WHEN ? < ? THEN ? ELSE ? END,
  CASE WHEN ? < ? THEN ? ELSE ? END,
  ?
);


-- Q16 — Create a new relationship type
-- English: "Create new relation type in my database {name, description}"
-- Params: (name, description)
INSERT INTO RelationshipType (name, description)
VALUES (?, ?);


-- Q17 — Update the relationship type for a pair to a new type
-- English: "Update relationship type with a person to a new relation type {name, newRelationType}"
-- Params:
--   newRelTypeKey,
--   personA, personB, personA, personB,  -- perkey1
--   personA, personB, personA, personB   -- perkey2
UPDATE Relationships
SET relTypeKey = ?
WHERE perkey1 = CASE WHEN ? < ? THEN ? ELSE ? END
  AND perkey2 = CASE WHEN ? < ? THEN ? ELSE ? END;


-- Q18 — Find all relationships of a given type
-- English: "Search for all relationships whose relationship type is X"
-- Params: (relTypeNameFilter)
SELECT r.perkey1,
       r.perkey2,
       r.startDate,
       pA.firstName || ' ' || pA.lastName AS personA,
       pB.firstName || ' ' || pB.lastName AS personB
FROM Relationships r
JOIN RelationshipType rt ON rt.relTypeKey = r.relTypeKey
JOIN Person pA           ON pA.perkey      = r.perkey1
JOIN Person pB           ON pB.perkey      = r.perkey2
WHERE rt.name = ?
ORDER BY personA, personB;


-- Q19 — Delete a relationship type
-- English: "Delete a relationship type"
-- Params: (relTypeNameToDelete)
DELETE FROM RelationshipType
WHERE name = ?;



-- =========================================================
-- Reminders
-- =========================================================

-- Q20 — Create a reminder
-- English: "Create a reminder (dinner plans with michael on november 15 at 5pm)"
-- Params: (title, description, dueDate 'YYYY-MM-DD HH:MM:SS', lastContactDate NULLABLE)
INSERT INTO Reminders (title, description, dueDate, completed, lastContactDate)
VALUES (?, ?, ?, 0, ?);


-- Helper — Link a reminder to a person
-- English: "Link reminder to person"
-- Params: (remkey, perkey)
INSERT INTO remPer (remkey, perkey)
VALUES (?, ?);


-- Q21 — All upcoming reminders (incomplete)
-- English: "Find all reminders for all time (upcoming)"
-- Params: none
SELECT remkey,
       title,
       description,
       dueDate,
       completed
FROM Reminders
WHERE completed = 0
  AND date(dueDate) >= date('now')
ORDER BY datetime(dueDate);


-- Q22 — Reminders due today
-- English: "Find all the reminders whose due date is today"
-- Params: none
SELECT remkey,
       title,
       description,
       dueDate,
       completed
FROM Reminders
WHERE date(dueDate) = date('now')
ORDER BY datetime(dueDate);


-- Q23 — Delete reminders due yesterday
-- English: "Delete a reminder whose due date was yesterday"
-- Params: none
DELETE FROM Reminders
WHERE date(dueDate) = date('now','-1 day');


-- Q24 — Reminders involving a given person
-- English: "Search for all reminders who involve this person"
-- Params: (personKey)
SELECT r.remkey,
       r.title,
       r.description,
       r.dueDate,
       r.completed
FROM Reminders r
JOIN remPer rp ON rp.remkey = r.remkey
WHERE rp.perkey = ?
ORDER BY datetime(r.dueDate);


-- Q25 — Update the due date of a reminder
-- English: "Update the due date of a reminder"
-- Params: (newDueDate, remkey)
UPDATE Reminders
SET dueDate = ?
WHERE remkey = ?;



-- =========================================================
-- Category
-- =========================================================

-- Q26 — Create a new category
-- English: "Create new category"
-- Params: (name, description)
INSERT OR IGNORE INTO Category (name, description)
VALUES (?, ?);


-- Q27 — People in a given category
-- English: "Find all people who enjoy gaming"
-- Params: (categoryName)
SELECT p.perkey,
       p.firstName,
       p.lastName
FROM Person p
JOIN perCat pc ON pc.perkey = p.perkey
JOIN Category c ON c.catkey = pc.catkey
WHERE c.name = ?
ORDER BY p.lastName, p.firstName;


-- Q28 — Add a person to the 'Soccer Player' category
-- English: "Update person to soccer player category"
-- Step (a): ensure category exists (no params)
INSERT OR IGNORE INTO Category (name, description)
VALUES ('Soccer Player', 'Plays soccer');

-- Step (b): link person → category
-- Params: (perkey)
INSERT OR IGNORE INTO perCat (perkey, catkey)
SELECT ?, c.catkey
FROM Category c
WHERE c.name = 'Soccer Player';


-- Q29 — Delete a category (remove mappings first)
-- English: "Delete category"
-- Step (a): remove mappings — Params: (categoryName)
DELETE FROM perCat
WHERE catkey = (SELECT catkey FROM Category WHERE name = ?);

-- Step (b): delete category — Params: (categoryName)
DELETE FROM Category
WHERE name = ?;


-- Q30 — People who like a category AND are Friends
-- English: "Find all people who like <category> and are friends in relationship type"
-- Params: (categoryName)
SELECT DISTINCT p.perkey,
       p.firstName,
       p.lastName
FROM Person p
JOIN perCat pc       ON pc.perkey = p.perkey
JOIN Category c      ON c.catkey  = pc.catkey
JOIN Relationships r ON r.perkey1 = p.perkey OR r.perkey2 = p.perkey
JOIN RelationshipType rt ON rt.relTypeKey = r.relTypeKey
WHERE c.name = ?
  AND rt.name = 'Friend'
ORDER BY p.lastName, p.firstName;