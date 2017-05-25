from flask import g
from linvis import app
import psycopg2


def connect_db():
    return psycopg2.connect(
                database='postgres',
                user='postgres',
                host='gl-postgres')


def get_db():
    db = getattr(g, 'db', None)
    if db is None:
        db = g.db = connect_db()
    return db


def get_cursor(name=None):
    if name is not None:
        return get_db().cursor(name=name)
    else:
        return get_db().cursor()


def query_db(query, args=(), one=False):
    cur = get_cursor()
    cur.execute(query, args)
    if one:
        try:
            rv = cur.fetchone()
        except:
            cur.close()
            rv = None
    else:
        try:
            rv = cur.fetchall()
        except:
            cur.close()
            rv = None
    cur.close()
    return rv if rv else None


@app.before_request
def open_db():
    g.db = connect_db()


@app.teardown_request
def close_db(exception):
    if exception:
        print("Exception:", exception)
    db = getattr(g, 'db', None)
    if db is not None:
        db.close()
