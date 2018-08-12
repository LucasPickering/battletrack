# Battletrack
PUBG map stuff

## Development
### Setup
1. Install Docker and Docker Compose
1. `git submodule init && git submodule update`
1. [OPTIONAL] Set up git hooks by running `bin/hooks.py`
1. Save your API key to `key`
1. `cd frontend && npm install`

### Running
```
source bin/dev.sh
docker-compose up
```

### Migrations
```
docker-compose run backend ./manage.py makemigrations
docker-compose run backend ./manage.py migrate
```

### Updating Assets
```
frontend/assets.py pull
frontend/assets.py tile # If map image(s) updated
```

### Testing
```
docker-compose run backend ./manage.py test
docker-compose run frontend npm run test
```

## Production
### Creating a new swarm manager
1. Install Docker
1. [Set up remote docker access with TLS](https://github.com/IcaliaLabs/guides/wiki/Deploy-and-Secure-a-Remote-Docker-Engine)
1. `mkdir -p /var/log/battletrack /var/lib/postgresql`
1. Add it to the swarm (flesh this out more pls)
