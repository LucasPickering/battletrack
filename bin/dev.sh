#!/bin/sh

export UID=$(id -u)
export GID=$(id -g)
export BT_DEV_API_KEY=$(cat ./keys/pubg)
docker-compose $@
