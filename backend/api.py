from flask import Blueprint, jsonify, request
from ORM_models import db, Person, Notes, Reminders

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