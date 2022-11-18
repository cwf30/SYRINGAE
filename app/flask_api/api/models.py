from . import db

class Tailocin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    reference = db.Column(db.Boolean)
    name = db.Column(db.Text)
    aligned_seq = db.Column(db.Text)
    unaligned_seq = db.Column(db.Text)
    