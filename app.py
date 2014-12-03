#!flask/bin/python
import os
import datetime
import random
from flask import Flask, abort, request, jsonify, g, url_for, make_response, redirect, send_from_directory
from flask.ext.httpauth import HTTPBasicAuth
from flask.views import MethodView
from flask.ext.restful import Api, Resource, reqparse, fields, marshal
from flask.ext.sqlalchemy import SQLAlchemy
from passlib.apps import custom_app_context as pwd_context
from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String

from itsdangerous import TimedJSONWebSignatureSerializer as Serializer, BadSignature, SignatureExpired

import config 

# initialization
app = Flask(__name__)
#app = Flask(__name__, static_url_path = "")
app.config['SECRET_KEY'] = config.SECRET_KEY
app.config['SQLALCHEMY_DATABASE_URI'] = config.SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_MIGRATE_REPO'] = config.SQLALCHEMY_MIGRATE_REPO
app.config['SQLALCHEMY_COMMIT_ON_TEARDOWN'] = config.SQLALCHEMY_COMMIT_ON_TEARDOWN

api = Api(app)

#from yourapplication.database import Base
db = SQLAlchemy(app)

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
    text = db.Column(db.String(140))
    creation = db.Column(db.DateTime(),default=datetime.datetime.utcnow)
    due = db.Column(db.Integer)
    relevance = db.Column(db.Enum(DO_OR_DIE, IMPORTANT, BETTER_DONE, MEH))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    done = db.Column(db.Boolean(), default=False)

    def toDict(self):
        return {
            'id': self.id,
            'text': self.text,
            'due': self.due,
            'creation': str(self.creation),
            'relevance': self.relevance,
            'done': self.done
        }

# extensions
auth = HTTPBasicAuth()


@auth.get_password
def get_password(username):
    user = User.query.filter_by(username = username).first()
    if user:
        return user.password_hash
    return None
 
@auth.error_handler
def unauthorized():
    return make_response(jsonify( { 'message': 'Unauthorized access' } ), 403)
    # return 403 instead of 401 to prevent browsers from displaying the default auth dialog
    

task_fields = {
    'text': fields.String,
    'creation': fields.String,
    'due': fields.Integer,
    'relevance': fields.String,
    'done': fields.Boolean,
    'uri': fields.Url('task')
}







@auth.verify_password
def verify_password(username_or_token, password):
    # first try to authenticate by token
    user = User.verify_auth_token(username_or_token)
    if not user:
        # try to authenticate with username/password
        user = User.query.filter_by(username = username_or_token).first()
        if not user or not user.verify_password(password):
            return False
    g.user = user
    return True

@app.route('/api/users', methods = ['POST'])
def new_user():
    #curl -i -X POST -H "Content-Type: application/json" -d '{"username":"test","password":"test"}' http://127.0.0.1:5000/api/users
    username = request.json.get('username')
    password = request.json.get('password')
    if username is None or password is None:
        abort(400) # missing arguments
    if User.query.filter_by(username = username).first() is not None:
        abort(400) # existing user
    user = User(username = username)
    user.hash_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify({ 'username': user.username }), 201, {'Location': url_for('get_user', id = user.id, _external = True)}

@app.route('/api/users/<int:id>')
def get_user(id):
    user = User.query.get(id)
    if not user:
        abort(400)
    return jsonify({ 'username': user.username })

@app.route('/api/token')
@auth.login_required
def get_auth_token():
    token = g.user.generate_auth_token(600)
    return jsonify({ 'token': token.decode('ascii'), 'duration': 600 })

class TaskListAPI(Resource):
    decorators = [auth.login_required]

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('text', type = str, required = True, help = 'No task text provided', location = 'json')
        self.reqparse.add_argument('due', type = str, required = True, help = 'No task due (remaining days) provided', location = 'json')
        self.reqparse.add_argument('relevance', type = str, required = True, help = 'No task relevance provided', location = 'json')
        super(TaskListAPI, self).__init__()
        
    def get(self):
        """
        lists all tasks from current user
        ex.:
        curl -u user:pass -i -X GET http://127.0.0.1:5000/api/tasks
        """
        tasks = Task.query.filter_by(user_id = g.user.id).all()
        return { 'tasks': map(lambda t: t.toDict(), tasks) }

    def post(self):
        """
        creates a task for the current user
        ex.:
        curl -i -X POST -H "Content-Type: application/json" -d '{"text":"do something","due":8, "relevance":"DO_OR_DIE"}' -u user:pass http://127.0.0.1:5000/api/tasks
        """
        args = self.reqparse.parse_args()

        text = request.json.get('text')
        due = request.json.get('due')
        relevance = request.json.get('relevance')

        if relevance not in (DO_OR_DIE, IMPORTANT, BETTER_DONE, MEH):
            abort(400) # relevance: not admitted value
        if text is None:
            abort(400) # text: not admitted value
        if due is None:
            abort(400) # text: not admitted value

        task = Task()
        task.text = text
        task.due = due
        task.relevance = relevance
        task.user_id = g.user.id

        db.session.add(task)
        db.session.commit()

        return jsonify({ 'task': task.toDict() })

api.add_resource(TaskListAPI, '/api/tasks', endpoint = 'tasks')


class TaskAPI(Resource):
    decorators = [auth.login_required]
    
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('text', type = str, location = 'json')
        self.reqparse.add_argument('due', type = str, location = 'json')
        self.reqparse.add_argument('priority', type = bool, location = 'json')
        self.reqparse.add_argument('done', type = bool, location = 'json')
        super(TaskAPI, self).__init__()

    def put(self, id):
        """
        updates a task for the current user
        ex.:
        curl -i -X PUT -H "Content-Type: application/json" -d '{"text":"do something new"}' -u test:test http://127.0.0.1:5000/api/tasks/1
        """
        task = Task.query.filter_by(user_id = g.user.id, id = id).first()
        if not task:
            abort(404)
        args = self.reqparse.parse_args()
        for k, v in args.iteritems():
            print "attr", k, v
            if v != None:
                task.__setattr__(k, v)
        db.session.add(task)
        db.session.commit()
        return jsonify({ 'task': task.toDict() })

api.add_resource(TaskAPI, '/api/tasks/<int:id>', endpoint = 'task')

class RandomAnonymousTaskAPI(Resource):

    def __init__(self):
        super(RandomAnonymousTaskAPI, self).__init__()
        

    def get(self):
        """
        returns a random anonymous task
        ex.:
        curl -i -X GET http://127.0.0.1:5000/api/app/randomAnonymousTask
        """
        randomTask = db.session.query(Task)[random.randrange(0, db.session.query(Task).count())]
        return jsonify({ 'task': randomTask.toDict() })

api.add_resource(RandomAnonymousTaskAPI, '/api/app/randomAnonymousTask', endpoint = 'randomAnonymousTask')



@app.route('/')
def home():
    return send_from_directory(os.path.join(app.root_path, 'static'), 'index.html')

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'), 'img/favicon.ico', mimetype='image/vnd.microsoft.icon')

if __name__ == '__main__':
    #if not os.path.exists('db.sqlite'):
    #    db.create_all()
    app.run(debug = config.DEBUG)


