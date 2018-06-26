action=$1


case "$action" in
    "run" )
        args="up"
    ;;
    "makemigrations" )
        args="run backend ./manage.py makemigrations"
    ;;
    "migrate" )
        args="run backend ./manage.py migrate"
    ;;
    "testback" )
        args="run backend ./manage.py test"
    ;;
    "testfront" )
        args="run -e CI=true frontend npm test"
    ;;
esac

set -ex
export DOCKER_UID=$(id -u)
export DOCKER_GID=$(id -g)
docker-compose $args
docker-compose rm -s -f
