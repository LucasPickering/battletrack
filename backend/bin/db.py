#!/usr/bin/env python3

import argparse
import glob
import os
import platform
import subprocess

import django_cli  # Init Django
from django.core.management import execute_from_command_line


def run_psql_cmds(*psql_cmds):
    system = platform.system()
    if system == 'Linux':
        psql_cmd = ['sudo', '-u', 'postgres', 'psql', '-v', 'ON_ERROR_STOP=1']
    elif system == 'Darwin':
        psql_cmd = ['psql', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1']
    else:
        raise ValueError(f"Unrecognized OS: {system}")

    psql_cmds_str = ' '.join(psql_cmds)

    print(f"psql input: {psql_cmds_str}")
    rv = subprocess.run(psql_cmd, input=psql_cmds_str, encoding='utf8', check=True)
    print(rv)


def init(args):
    run_psql_cmds(
        "CREATE USER btuser WITH PASSWORD 'btpassword';",
        "ALTER USER btuser CREATEDB;",
        "CREATE DATABASE myproject;",
        "ALTER ROLE btuser SET client_encoding TO 'utf8';",
        "ALTER ROLE btuser SET default_transaction_isolation TO 'read committed';",
        "GRANT ALL PRIVILEGES ON DATABASE myproject TO myprojectuser;",
    )


def migrate(args):
    migration_files = glob.glob('*/migrations/0*.py')
    print(f"Deleting old migrations: {migration_files}")
    for mf in migration_files:
        os.remove(mf)

    print("Making new migrations...")
    execute_from_command_line(['manage.py', 'makemigrations'])

    print("Migrating...")
    run_psql_cmds(
        "DROP DATABASE battletrack;",
        "CREATE DATABASE battletrack;",
        "GRANT ALL PRIVILEGES ON DATABASE battletrack TO btuser;",
    )
    execute_from_command_line(['manage.py', 'migrate'])


ACTIONS = {
    'init': init,
    'migrate': migrate,
}

if __name__ == '__main__':
    parser = argparse.ArgumentParser("Helper script for performing annoying DB actions")
    parser.add_argument('action', choices=ACTIONS.keys())
    args = parser.parse_args()

    func = ACTIONS[args.action]
    func(args)
