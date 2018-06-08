#!/bin/sh

# Deletes old migrations and generates new ones, then deletes the DB, re-creates it, and migrates
set -e -x
rm btcore/migrations/0*.py
rm telemetry/migrations/0*.py
python3 manage.py makemigrations
case "$(uname)" in
    "Linux" )
        sudo -u postgres psql -v 'ON_ERROR_STOP=1' -c 'DROP DATABASE battletrack;' -c 'CREATE DATABASE battletrack;' -c 'GRANT ALL PRIVILEGES ON DATABASE battletrack TO btuser;'
    ;;
    "Darwin" )
        psql -d postgres -v 'ON_ERROR_STOP=1' -c 'DROP DATABASE battletrack;' -c 'CREATE DATABASE battletrack;' -c 'GRANT ALL PRIVILEGES ON DATABASE battletrack TO btuser;'
    ;;
esac
python3 manage.py migrate
