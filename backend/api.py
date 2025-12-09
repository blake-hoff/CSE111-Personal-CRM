from flask import Blueprint, jsonify, request
from ORM_models import db, Person, Notes, Reminders, Relationships, NotedPerson, RemPer
from sqlalchemy import func

bp = Blueprint('api', __name__, url_prefix='/api')

# -------------------------------------------------
# Utility: Convert a SQLAlchemy model to dict
# -------------------------------------------------
def model_to_dict(obj):
    result = {}
    for col in obj.__table__.columns:
        result[col.name] = getattr(obj, col.name)
    return result


# =================================================
# PERSONS API
# =================================================
@bp.route('/persons', methods=['GET'])
def list_persons():
    persons = Person.query.all()
    return jsonify([model_to_dict(p) for p in persons])


@bp.route('/persons/<int:perkey>', methods=['GET'])
def get_person(perkey):
    p = Person.query.get_or_404(perkey)
    return jsonify(model_to_dict(p))


@bp.route('/persons', methods=['POST'])
def create_person():
    data = request.json or {}
    p = Person(
        firstName=data.get('firstName', ''),
        lastName=data.get('lastName', ''),
        birthday=data.get('birthday'),
        location=data.get('location'),
        photokey=data.get('photokey')
    )
    db.session.add(p)
    db.session.commit()
    return jsonify(model_to_dict(p)), 201


@bp.route('/persons/<int:perkey>', methods=['PUT'])
def update_person(perkey):
    p = Person.query.get_or_404(perkey)
    data = request.json or {}

    for field in ['firstName', 'lastName', 'birthday', 'location', 'photokey']:
        if field in data:
            setattr(p, field, data[field])

    db.session.commit()
    return jsonify(model_to_dict(p))


@bp.route('/persons/<int:perkey>', methods=['DELETE'])
def delete_person(perkey):
    p = Person.query.get_or_404(perkey)
    db.session.delete(p)
    db.session.commit()
    return '', 204


# =================================================
# NOTES API
# =================================================
@bp.route('/notes', methods=['GET'])
def list_notes():
    notes = Notes.query.all()
    return jsonify([
        {
            "id": n.notekey,
            "title": n.title,
            "content": n.content,
            "created_at": n.dateCreated,
            "updated_at": n.lastModified
        }
        for n in notes
    ])


@bp.route('/notes', methods=['POST'])
def create_note():
    data = request.json or {}
    note = Notes(
        title=data.get("title", ""),
        content=data.get("content", "")
    )
    db.session.add(note)
    db.session.commit()
    return jsonify({"id": note.notekey}), 201


@bp.route('/notes/<int:id>', methods=['GET'])
def get_note(id):
    note = Notes.query.get_or_404(id)
    return jsonify({
        "id": note.notekey,
        "title": note.title,
        "content": note.content,
        "created_at": note.dateCreated,
        "updated_at": note.lastModified
    })


@bp.route('/notes/<int:id>', methods=['PUT'])
def update_note(id):
    note = Notes.query.get_or_404(id)
    data = request.json or {}

    note.title = data.get("title", note.title)
    note.content = data.get("content", note.content)

    db.session.commit()
    return jsonify({"message": "updated"})


@bp.route('/notes/<int:id>', methods=['DELETE'])
def delete_note(id):
    note = Notes.query.get_or_404(id)
    db.session.delete(note)
    db.session.commit()
    return jsonify({"message": "deleted"})


@bp.route('/reminders', methods=['GET'])
def list_reminders():
    reminders = Reminders.query.all()
    return jsonify([
        {
            "id": r.remkey,
            "label": r.title,                 # map DB title → frontend label
            "description": r.description,
            "due_date": r.dueDate,           # map dueDate → due_date
            "completed": r.completed
        }
        for r in reminders
    ])


@bp.route('/reminders', methods=['POST'])
def create_reminder():
    data = request.json or {}

    r = Reminders(
        title=data.get("label", ""),         # label → title
        description=data.get("description"),
        dueDate=data.get("due_date"),        # due_date → dueDate
        completed=data.get("completed", False)
    )

    db.session.add(r)
    db.session.commit()

    return jsonify({"id": r.remkey}), 201


@bp.route('/reminders/<int:id>', methods=['PUT'])
def update_reminder(id):
    r = Reminders.query.get_or_404(id)
    data = request.json or {}

    if "label" in data:
        r.title = data["label"]
    if "description" in data:
        r.description = data["description"]
    if "due_date" in data:
        r.dueDate = data["due_date"]
    if "completed" in data:
        r.completed = data["completed"]

    db.session.commit()
    return jsonify({"message": "Reminder updated"})


@bp.route('/reminders/<int:id>', methods=['DELETE'])
def delete_reminder(id):
    r = Reminders.query.get_or_404(id)
    db.session.delete(r)
    db.session.commit()
    return '', 204






# List reminders for a specific person
@bp.route('/persons/<int:perkey>/reminders', methods=['GET'])
def list_person_reminders(perkey):
    p = Person.query.get_or_404(perkey)
    reminders = [
        {
            "id": rp.remkey,
            "label": rp.reminder.title,
            "description": rp.reminder.description,
            "due_date": rp.reminder.dueDate,
            "completed": rp.reminder.completed
        }
        for rp in p.rem_pers
    ]
    return jsonify(reminders)


# Add a reminder to a person
@bp.route('/persons/<int:perkey>/reminders', methods=['POST'])
def add_person_reminder(perkey):
    p = Person.query.get_or_404(perkey)
    data = request.json or {}

    rem = Reminders(
        title=data.get("label", ""),
        description=data.get("description"),
        dueDate=data.get("due_date"),
        completed=data.get("completed", False)
    )
    db.session.add(rem)
    db.session.flush()  # assign rem.remkey

    # Junction table
    rp = RemPer(remkey=rem.remkey, perkey=p.perkey)
    db.session.add(rp)
    db.session.commit()

    return jsonify({"id": rem.remkey}), 201

# Update a reminder for a person
@bp.route('/persons/<int:perkey>/reminders/<int:remkey>', methods=['PUT'])
def update_person_reminder(perkey, remkey):
    rp = RemPer.query.filter_by(perkey=perkey, remkey=remkey).first_or_404()
    rem = rp.reminder

    data = request.json or {}
    rem.title = data.get("label", rem.title)
    rem.description = data.get("description", rem.description)
    rem.dueDate = data.get("due_date", rem.dueDate)
    rem.completed = data.get("completed", rem.completed)

    db.session.commit()
    return jsonify({"message": "reminder updated"})


# Delete a reminder for a person
@bp.route('/persons/<int:perkey>/reminders/<int:remkey>', methods=['DELETE'])
def delete_person_reminder(perkey, remkey):
    rp = RemPer.query.filter_by(perkey=perkey, remkey=remkey).first_or_404()
    rem = rp.reminder

    # remove junction first
    db.session.delete(rp)
    db.session.delete(rem)
    db.session.commit()
    return jsonify({"message": "reminder deleted"})




# List notes for a specific person
@bp.route('/persons/<int:perkey>/notes', methods=['GET'])
def list_person_notes(perkey):
    p = Person.query.get_or_404(perkey)
    notes = [
        {
            "id": np.notekey,
            "title": np.note.title,
            "content": np.note.content
        }
        for np in p.noted_person_entries
    ]
    return jsonify(notes)


# Add a note to a person
@bp.route('/persons/<int:perkey>/notes', methods=['POST'])
def add_person_note(perkey):
    p = Person.query.get_or_404(perkey)
    data = request.json or {}

    note = Notes(title=data.get("title", ""), content=data.get("content", ""))
    db.session.add(note)
    db.session.flush()  # assign note.notekey

    # Junction table
    np = NotedPerson(perkey=p.perkey, notekey=note.notekey)
    db.session.add(np)
    db.session.commit()

    return jsonify({"id": note.notekey}), 201

# Update a note for a person
@bp.route('/persons/<int:perkey>/notes/<int:notekey>', methods=['PUT'])
def update_person_note(perkey, notekey):
    # ensure the note belongs to this person
    np = NotedPerson.query.filter_by(perkey=perkey, notekey=notekey).first_or_404()
    note = np.note

    data = request.json or {}
    note.title = data.get("title", note.title)
    note.content = data.get("content", note.content)

    db.session.commit()
    return jsonify({"message": "note updated"})


# Delete a note for a person
@bp.route('/persons/<int:perkey>/notes/<int:notekey>', methods=['DELETE'])
def delete_person_note(perkey, notekey):
    np = NotedPerson.query.filter_by(perkey=perkey, notekey=notekey).first_or_404()
    note = np.note

    # remove junction first
    db.session.delete(np)
    db.session.delete(note)
    db.session.commit()
    return jsonify({"message": "note deleted"})

# List relationships for a person
@bp.route('/persons/<int:perkey>/relationships', methods=['GET'])
def list_person_relationships(perkey):
    p = Person.query.get_or_404(perkey)
    relationships = []

    for rel in p.rels_as_first + p.rels_as_second:
        other = rel.person2 if rel.person1.perkey == p.perkey else rel.person1
        relationships.append({
            "relTypeKey": rel.relTypeKey,
            "type": rel.rel_type.name,
            "withPerson": {
                "perkey": other.perkey,
                "firstName": other.firstName,
                "lastName": other.lastName
            }
        })

    return jsonify(relationships)


# Add a relationship
@bp.route('/persons/<int:perkey>/relationships', methods=['POST'])
def add_relationship(perkey):
    p1 = Person.query.get_or_404(perkey)
    data = request.json or {}

    p2key = data.get("perkey2")
    relTypeKey = data.get("relTypeKey")
    if not p2key or not relTypeKey:
        return jsonify({"error": "perkey2 and relTypeKey required"}), 400

    p2 = Person.query.get_or_404(p2key)

    # Ensure perkey1 < perkey2 for CheckConstraint
    perkey1, perkey2 = sorted([p1.perkey, p2.perkey])

    rel = Relationships(perkey1=perkey1, perkey2=perkey2, relTypeKey=relTypeKey)
    db.session.add(rel)
    db.session.commit()
    return jsonify({"message": "relationship added"}), 201
# Update relationship type
@bp.route('/persons/<int:perkey>/relationships/<int:other_perkey>', methods=['PUT'])
def update_relationship(perkey, other_perkey):
    # order keys to satisfy CheckConstraint
    perkey1, perkey2 = sorted([perkey, other_perkey])
    rel = Relationships.query.filter_by(perkey1=perkey1, perkey2=perkey2).first_or_404()

    data = request.json or {}
    if "relTypeKey" in data:
        rel.relTypeKey = data["relTypeKey"]

    db.session.commit()
    return jsonify({"message": "relationship updated"})


# Delete a relationship
@bp.route('/persons/<int:perkey>/relationships/<int:other_perkey>', methods=['DELETE'])
def delete_relationship(perkey, other_perkey):
    perkey1, perkey2 = sorted([perkey, other_perkey])
    rel = Relationships.query.filter_by(perkey1=perkey1, perkey2=perkey2).first_or_404()

    db.session.delete(rel)
    db.session.commit()
    return jsonify({"message": "relationship deleted"})


# Get one person-specific note
@bp.route('/persons/<int:perkey>/notes/<int:notekey>', methods=['GET'])
def get_person_note(perkey, notekey):
    np = NotedPerson.query.filter_by(perkey=perkey, notekey=notekey).first_or_404()
    note = np.note
    return jsonify({
        "id": note.notekey,
        "title": note.title,
        "content": note.content
    })

# Get one person-specific reminder
@bp.route('/persons/<int:perkey>/reminders/<int:remkey>', methods=['GET'])
def get_person_reminder(perkey, remkey):
    rp = RemPer.query.filter_by(perkey=perkey, remkey=remkey).first_or_404()
    r = rp.reminder
    return jsonify({
        "id": r.remkey,
        "label": r.title,
        "description": r.description,
        "due_date": r.dueDate,
        "completed": r.completed
    })
