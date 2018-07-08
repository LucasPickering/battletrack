action=$1
shift
rest_args=$*


case "$action" in
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
    * )
        args=$action
    ;;
esac

set -ex
export DOCKER_UID=$(id -u)
export DOCKER_GID=$(id -g)
docker-compose $args $rest_args
docker-compose rm -s -f
