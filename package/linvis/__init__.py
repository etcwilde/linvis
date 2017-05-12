# from linvis.app import app

from flask import Flask
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)

import linvis.views
import linvis.data
import linvis.database
