# Battletrack
PUBG map stuff

## Development
### Setup
1. Install Docker and Docker Compose
1. Save your API key to `key`
1. `source bin/dev.sh`
1. [OPTIONAL] Set up git hooks by running `bin/hooks.py`
1. Run:
    * `cd frontend && npm install`
    * `docker-compose up`

### Migrations
```
docker-compose makemigrations
docker-compose migrate
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
