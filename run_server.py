#!/bin/python3

# Basic Tester program
# Runs flask server on port 8080
#
# Evan Wilde                                <etcwilde@uvic.ca>
# 2016
#

import os
from linvis import app

DEBUG = True
IP_ADDRESS = '0.0.0.0'
PORT_NUMBER = 8080
THREADED = False
SECRET_KEY = os.urandom(24)

app.secret_key = SECRET_KEY
app.run(host=IP_ADDRESS, port=PORT_NUMBER, debug=DEBUG, threaded=THREADED)
