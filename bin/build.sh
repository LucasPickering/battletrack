#!/bin/sh

# Builds all necessary images for a production deploy
docker build -t registry.gitlab.com/lucaspickering/battletrack/backend backend
docker build -t registry.gitlab.com/lucaspickering/battletrack/frontend frontend
docker build -t registry.gitlab.com/lucaspickering/battletrack/prod prod
