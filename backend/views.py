from flask_admin.contrib.sqla import ModelView

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
        "photokey",
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