from flask import Flask

import os
import re

app = Flask(__name__)

config_file = "app.conf"
key_file = os.path.join('./', 'secret_key')

db_login_pattern = r'^db_login ?= ?"(.*)"$'
db_name_pattern = r'^db_name ? = ?"(.*)"$'


def pad_pass(passwd, secret):
    if type(passwd) is str:
        passwd = passwd.encode('utf-8')
    output = bytearray()
    for i in range(0, len(passwd)):
        output.append(passwd[i] ^ secret[i % len(secret)])
    return output


def init():
    print("Initializing Server")
    # Generate Secret and do that
    try:
        app.secret_key = open(key_file, 'rb').read()
    except IOError:
        key = os.urandom(24)
        with open(key_file, 'wb+') as f:
            f.write(key)
        app.secret_key = key
    db_login = "linux_app"
    db_name = "gitlinux"
    password = pad_pass("", app.secret_key)

    # with open(config_file, 'r') as config:
    #     for line in config:
    #         if line[0] == '#':  # Ignore rid of commends immediately
    #             continue
    #         db_login_matches = re.match(db_login_pattern, line)
    #         if db_login_matches:
    #             db_login = db_login_matches.group(1)
    #             print("Set Username:", db_login)
    #             continue
    #         db_name_matches = re.match(db_name_pattern, line)
    #         if db_name_matches:
    #             db_name = db_name_matches.group(1)
    #             print("Set database name:", db_name)
    #             continue
    return (db_login, password, db_name)

# read_secret()
db_config = init()
