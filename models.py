from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String
from yourapplication.database import Base

from app import db

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key = True)
    username = db.Column(db.String(32), index = True)
    password_hash = db.Column(db.String(64))

    def hash_password(self, password):
        self.password_hash = pwd_context.encrypt(password)

    def verify_password(self, password):
        return pwd_context.verify(password, self.password_hash)

    def generate_auth_token(self, expiration = 600):
        s = Serializer(app.config['SECRET_KEY'], expires_in = expiration)
        return s.dumps({ 'id': self.id })

    @staticmethod
    def verify_auth_token(token):
        s = Serializer(app.config['SECRET_KEY'])
        try:
            data = s.loads(token)
        except SignatureExpired:
            return None # valid token, but expired
        except BadSignature:
            return None # invalid token
        user = User.query.get(data['id'])
        return user

#relevance alternatives
DO_OR_DIE, IMPORTANT, BETTER_DONE, MEH = ('DO_OR_DIE', 'IMPORTANT', 'BETTER_DONE', 'MEH')

class Task(db.Model):
    __tablename__ = 'tasks'
    id = db.Column(db.Integer, primary_key = True)
    text = db.Column(db.String(32))
    creation = db.Column(db.DateTime())
    due = db.Column(db.Date())
    relevance = db.Column(db.Enum(DO_OR_DIE, IMPORTANT, BETTER_DONE, MEH))

