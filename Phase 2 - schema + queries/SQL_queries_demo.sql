PRAGMA foreign_keys = ON;

.headers on
.mode column

/* =========================================================
   NOTES QUERIES (Q1–Q5)
   ========================================================= */

-- Q1 — Insert a new note
-- "Insert a new note"
INSERT INTO Notes (title, content)
VALUES (
  'CSE111 group project check-in',
  'Met with Jason and Blake to discuss the personal CRM schema for CSE111.'
);

SELECT * FROM Notes ORDER BY notekey DESC LIMIT 3;


-- Q2 — Attach a photo to an existing note
-- "Create a new note photo regarding an already created note"
-- Use latest note and group photo (photokey=4 from example data)
INSERT INTO NotePhoto (notekey, photokey)
SELECT n.notekey, 4
FROM Notes n
ORDER BY n.notekey DESC
LIMIT 1;

SELECT * FROM NotePhoto ORDER BY notekey, photokey;


-- Q3 — Notes involving a given person (Michael Wang)
-- "Search for all notes involving this person (michael)"
SELECT n.notekey, n.title, n.content, n.dateCreated, n.lastModified
FROM Person pe
JOIN NotedPerson np ON np.perkey = pe.perkey
JOIN Notes n        ON n.notekey = np.notekey
WHERE LOWER(pe.firstName) = LOWER('Michael')
  AND LOWER(pe.lastName)  = LOWER('Wang')
ORDER BY n.dateCreated DESC;


-- Q4 — Update a note (append text to the latest note)
-- "Update a note"
UPDATE Notes
SET content = COALESCE(content,'') || CHAR(10) || 'Added todo: finalize ER diagram before Monday.',
    lastModified = CURRENT_TIMESTAMP
WHERE notekey = (SELECT MAX(notekey) FROM Notes);

SELECT * FROM Notes
WHERE notekey = (SELECT MAX(notekey) FROM Notes);


-- Q5 — Delete a note (demonstration: delete the oldest note)
-- "DELETE note"
DELETE FROM Notes
WHERE notekey = (
  SELECT MIN(notekey) FROM Notes
);

SELECT notekey, title FROM Notes ORDER BY notekey;


/* =========================================================
   PERSON QUERIES (Q6–Q10)
   ========================================================= */

-- Q6 — Create a new person
-- "Create new person (firstName, lastName, birthday, location)"
INSERT INTO Person (photokey, firstName, lastName, birthday, location)
VALUES (
  NULL,
  'Test',
  'Student',
  '2005-01-01',
  'UC Merced, CA'
);

SELECT * FROM Person ORDER BY perkey;


-- Q7 — Update a person's information
-- (fixed syntax: UPDATE Person SET ...)
-- "Update a person's information"
-- Example: update the Test Student’s location and photo
UPDATE Person
SET firstName = COALESCE(NULL, firstName),
    lastName  = COALESCE(NULL, lastName),
    birthday  = COALESCE(NULL, birthday),
    location  = COALESCE('Updated location: Campus Apartments, UC Merced', location),
    photokey  = COALESCE(1, photokey)
WHERE perkey = (
  SELECT perkey
  FROM Person
  WHERE firstName = 'Test' AND lastName = 'Student'
  LIMIT 1
);

SELECT * FROM Person
WHERE firstName = 'Test' AND lastName = 'Student';


-- Q8 — List all people (contact list)
-- "Search for all people that are in your CRM to populate the contact list"
SELECT perkey, firstName, lastName, birthday, location
FROM Person
ORDER BY lastName, firstName;


-- Q9 — People matching criteria {birthday month, relationship type, location like}
-- Demo: people with birthday in July, who are Classmates, located in Merced
SELECT DISTINCT p.perkey, p.firstName, p.lastName, p.birthday, p.location
FROM Person p
LEFT JOIN Relationships r ON r.perkey1 = p.perkey OR r.perkey2 = p.perkey
LEFT JOIN RelationshipType rt ON rt.relTypeKey = r.relTypeKey
WHERE strftime('%m', p.birthday) = '07'
  AND rt.name = 'Classmate'
  AND p.location LIKE '%Merced%'
ORDER BY p.lastName, p.firstName;


-- Q10 — Delete a person
-- Demo: delete the Test Student person
DELETE FROM Person
WHERE firstName = 'Test' AND lastName = 'Student';

SELECT perkey, firstName, lastName FROM Person ORDER BY perkey;


/* =========================================================
   SOCIALTYPE & SOCIALLINKS QUERIES (Q11–Q14)
   ========================================================= */

-- Q11 — Create a new social network
-- "Create new social network {platformName, platformURL}"
INSERT INTO SocialType (platformName, platformURL)
VALUES ('GitHub', 'https://github.com');

SELECT * FROM SocialType ORDER BY socialkey;


-- Q12 — Delete a social network
-- "Delete a social network {socialType}"
DELETE FROM SocialType
WHERE platformName = 'GitHub';

SELECT * FROM SocialType ORDER BY socialkey;


-- Q13 — Create a social link
-- "Create Social link regarding a certain person in your CRM"
-- Example: add Michael’s GitHub
INSERT INTO SocialType (platformName, platformURL)
VALUES ('GitHub', 'https://github.com');

INSERT INTO SocialLinks (socialkey, perkey, handle, profileURL)
SELECT st.socialkey,
       p.perkey,
       'michael-ucm',
       'https://github.com/michael-ucm'
FROM SocialType st
JOIN Person p ON p.firstName = 'Michael' AND p.lastName = 'Wang'
WHERE st.platformName = 'GitHub';

SELECT * FROM SocialLinks ORDER BY perkey, socialkey;


-- Q14 — Update a social link
-- "Update social link for someone in your CRM"
-- Example: update Michael’s GitHub URL
UPDATE SocialLinks
SET handle = COALESCE('michaelwang-cse111', handle),
    profileURL = COALESCE('https://github.com/michaelwang-cse111', profileURL)
WHERE socialkey = (
        SELECT socialkey FROM SocialType WHERE platformName = 'GitHub'
      )
  AND perkey = (
        SELECT perkey FROM Person WHERE firstName = 'Michael' AND lastName = 'Wang'
      );

SELECT * FROM SocialLinks
WHERE perkey = (SELECT perkey FROM Person WHERE firstName='Michael' AND lastName='Wang');


/* =========================================================
   RELATIONSHIPTYPE & RELATIONSHIPS (Q15–Q19)
   ========================================================= */

-- Q15 — Create a relationship (store once with perkey1 < perkey2)
-- "Create a relationship with two people {perkey1, perkey2, startDate}"
-- Example: make Michael and Jason 'Friend'
INSERT OR IGNORE INTO Relationships (relTypeKey, perkey1, perkey2, startDate)
VALUES (
  (SELECT relTypeKey FROM RelationshipType WHERE name = 'Friend'),
  CASE WHEN 1 < 2 THEN 1 ELSE 2 END,
  CASE WHEN 1 < 2 THEN 2 ELSE 1 END,
  '2025-10-10'
);

SELECT * FROM Relationships ORDER BY perkey1, perkey2;


-- Q16 — Create a new relationship type
-- "Create new relation type in my database {name, description}"
INSERT INTO RelationshipType (name, description)
VALUES ('Study Buddy', 'Study partners in CSE111');

SELECT * FROM RelationshipType ORDER BY relTypeKey;


-- Q17 — Update the relationship type for a pair to a new type
-- "Update relationship type with a person to a new relation type {name, newRelationType}"
-- Example: change Michael–Jason to Study Buddy
UPDATE Relationships
SET relTypeKey = (
  SELECT relTypeKey FROM RelationshipType WHERE name = 'Study Buddy'
)
WHERE perkey1 = CASE WHEN 1 < 2 THEN 1 ELSE 2 END
  AND perkey2 = CASE WHEN 1 < 2 THEN 2 ELSE 1 END;

SELECT r.perkey1, r.perkey2, rt.name AS relType, r.startDate
FROM Relationships r
JOIN RelationshipType rt ON rt.relTypeKey = r.relTypeKey
ORDER BY perkey1, perkey2;


-- Q18 — Find all relationships of a given type
-- "Search for all relationships whose relationship type is enemies"
-- Demo: show all Study Buddy pairs
SELECT r.perkey1, r.perkey2, r.startDate,
       pA.firstName || ' ' || pA.lastName AS personA,
       pB.firstName || ' ' || pB.lastName AS personB
FROM Relationships r
JOIN RelationshipType rt ON rt.relTypeKey = r.relTypeKey
JOIN Person pA ON pA.perkey = r.perkey1
JOIN Person pB ON pB.perkey = r.perkey2
WHERE rt.name = 'Study Buddy'
ORDER BY personA, personB;


-- Q19 — Delete a relationship type
-- "Delete a relationship type"
-- Demo: create and then delete 'Enemy'
INSERT INTO RelationshipType (name, description)
VALUES ('Enemy', 'Adversarial relationship type for demonstration');

DELETE FROM RelationshipType
WHERE name = 'Enemy';

SELECT * FROM RelationshipType ORDER BY relTypeKey;


/* =========================================================
   REMINDERS (Q20–Q25)
   ========================================================= */

-- Q20 — Create a reminder
-- "Create a reminder (dinner plans with michael on november 15 at 5pm)"
INSERT INTO Reminders (title, description, dueDate, completed, lastContactDate)
VALUES (
  'Dinner with Michael',
  'Dinner with Michael after CSE111 lecture.',
  '2025-11-15 17:00:00',
  0,
  NULL
);

SELECT * FROM Reminders ORDER BY remkey DESC LIMIT 3;


-- Q21 — All upcoming reminders (incomplete)
-- "Find all reminders for all time (upcoming)"
SELECT remkey, title, description, dueDate, completed
FROM Reminders
WHERE completed = 0
  AND date(dueDate) >= date('now')
ORDER BY datetime(dueDate);


-- Q22 — Reminders due today
-- "Find all the reminders whose due date is today"
SELECT remkey, title, description, dueDate, completed
FROM Reminders
WHERE date(dueDate) = date('now')
ORDER BY datetime(dueDate);


-- Q23 — Delete reminders due yesterday
-- "Delete a reminder whose due date was yesterday"
DELETE FROM Reminders
WHERE date(dueDate) = date('now','-1 day');

SELECT remkey, title, dueDate FROM Reminders ORDER BY remkey;


-- Q24 — Reminders involving a given person (Michael)
-- "Search for all reminders who involve this person (michael)"
-- First link the dinner reminder to Michael
INSERT OR IGNORE INTO remPer (remkey, perkey)
SELECT r.remkey, p.perkey
FROM Reminders r
JOIN Person p ON p.firstName='Michael' AND p.lastName='Wang'
WHERE r.title = 'Dinner with Michael';

SELECT r.remkey, r.title, r.description, r.dueDate, r.completed
FROM Reminders r
JOIN remPer rp ON rp.remkey = r.remkey
WHERE rp.perkey = (SELECT perkey FROM Person WHERE firstName='Michael' AND lastName='Wang')
ORDER BY datetime(r.dueDate);


-- Q25 — Update the due date of a reminder
-- "Update the due date of a reminder"
UPDATE Reminders
SET dueDate = '2025-11-16 18:30:00'
WHERE title = 'Dinner with Michael';

SELECT remkey, title, dueDate FROM Reminders
WHERE title = 'Dinner with Michael';


/* =========================================================
   CATEGORY (Q26–Q30)
   ========================================================= */

-- Q26 — Create a new category
-- "Create new category"
INSERT OR IGNORE INTO Category (name, description)
VALUES ('Gamer', 'Enjoys playing video games');

SELECT * FROM Category ORDER BY catkey;


-- Q27 — People in a given category
-- "Find all people who enjoy gaming"
-- First, mark Jason as a Gamer
INSERT OR IGNORE INTO perCat (perkey, catkey)
SELECT p.perkey, c.catkey
FROM Person p, Category c
WHERE p.firstName = 'Jason'
  AND p.lastName  = 'Chen'
  AND c.name      = 'Gamer';

SELECT p.perkey, p.firstName, p.lastName
FROM Person p
JOIN perCat pc ON pc.perkey = p.perkey
JOIN Category c ON c.catkey = pc.catkey
WHERE c.name = 'Gamer'
ORDER BY p.lastName, p.firstName;


-- Q28 — Add a person to the 'Soccer Player' category
-- "Update person (cameron) to soccer player category"
-- Demo: add Blake as Soccer Player
INSERT OR IGNORE INTO Category (name, description)
VALUES ('Soccer Player', 'Plays soccer');

INSERT OR IGNORE INTO perCat (perkey, catkey)
SELECT p.perkey, c.catkey
FROM Person p, Category c
WHERE p.firstName = 'Blake'
  AND p.lastName  = 'Hoff'
  AND c.name      = 'Soccer Player';

SELECT p.perkey, p.firstName, p.lastName, c.name AS category
FROM Person p
JOIN perCat pc ON pc.perkey = p.perkey
JOIN Category c ON c.catkey = pc.catkey
WHERE c.name IN ('Gamer', 'Soccer Player')
ORDER BY p.lastName, p.firstName, c.name;


-- Q29 — Delete a category (remove mappings first)
-- "Delete category"
-- Demo: delete the Gamer category (and mappings)
DELETE FROM perCat
WHERE catkey = (SELECT catkey FROM Category WHERE name = 'Gamer');

DELETE FROM Category
WHERE name = 'Gamer';

SELECT * FROM Category ORDER BY catkey;


-- Q30 — People who like a category AND are Friends
-- "Find all people who like gaming and are friends in relationship type"
-- Demo: use 'Soccer Player' + 'Friend' instead
SELECT DISTINCT p.perkey, p.firstName, p.lastName
FROM Person p
JOIN perCat pc ON pc.perkey = p.perkey
JOIN Category c ON c.catkey = pc.catkey
JOIN Relationships r ON r.perkey1 = p.perkey OR r.perkey2 = p.perkey
JOIN RelationshipType rt ON rt.relTypeKey = r.relTypeKey
WHERE c.name = 'Soccer Player'
  AND rt.name = 'Friend'
ORDER BY p.lastName, p.firstName;