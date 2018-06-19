#!/bin/bash

set -ex

ALL="all"
component=$1

case "$component" in
    "backend" | $ALL )
        docker-compose run backend ./manage.py test
    ;;
    "frontend" | $ALL )
        docker-compose run -e CI=true frontend npm test
    ;;
esac
docker-compose rm -s -f
