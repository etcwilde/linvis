#!/bin/env python3

# Basic Tester program
# Runs flask server on port 8080
#
# Evan Wilde                                <etcwilde@uvic.ca>
# 2016
#

import os
from linvis import app

DEBUG = False
IP_ADDRESS = '0.0.0.0'
PORT_NUMBER = 80
THREADED = True

app.run(host=IP_ADDRESS, port=PORT_NUMBER, debug=DEBUG, threaded=THREADED)