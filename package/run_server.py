#!/bin/env python3

# Basic Tester program
# Runs flask server on port 5000
#
# Evan Wilde                                <etcwilde@uvic.ca>
# 2017
#

import os

extras_dirs = ['linvis/templates/', 'linvis/static/']
extra_files = []
for d in extras_dirs:
    for dirname, _, files in os.walk(d):
        for fname in files:
            fname = os.path.join(dirname, fname)
            extra_files.append(fname)


if __name__ == "__main__":
    from linvis import app
    DEBUG = True
    IP_ADDRESS = '0.0.0.0'
    PORT_NUMBER = 5000
    THREADED = True
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    print(extra_files)
    app.run(host=IP_ADDRESS, port=PORT_NUMBER, debug=DEBUG, threaded=THREADED,
            extra_files=extra_files)
