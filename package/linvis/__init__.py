# from linvis.app import app

from flask import Flask
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)

import linvis.views
import linvis.data
import linvis.database

@app.after_request
def cache_reponse(response):
    response.cache_control.max_age = 30672000
    response.cache_control.public = True
    return response
