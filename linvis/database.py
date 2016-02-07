from flask import g
from linvis.app import app, pad_pass, db_config

import psycopg2


def connect_db(db_config):
    return psycopg2.connect(database=db_config[2],
                            user=db_config[0],
                            password=pad_pass(db_config[1],
                                              app.secret_key).decode('utf-8'))


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
    g.db = connect_db(db_config)


@app.teardown_request
def close_db(exception):
    if exception:
        print("Exception:", exception)
    db = getattr(g, 'db', None)
    if db is not None:
        db.close()
