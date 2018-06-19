# Battletrack
PUBG map stuff

## Development
### Setup
1. Install Docker and Docker Compose
1. Save your API key to `backend/key.sh`
1. Run:
    * `source backend/key.sh`
    * `docker-compose up`

### Migrations
`docker-compose run backend ./manage.py migrate`

### Testing
```
./test.sh backend
./test.sh frontend
./test.sh all
```

## Production
### Creating a new swarm manager
1. Install Docker
1. [Set up remote docker access with TLS](https://github.com/IcaliaLabs/guides/wiki/Deploy-and-Secure-a-Remote-Docker-Engine)
1. `mkdir -p /var/log/battletrack /var/lib/postgresql`
1. Add it to the swarm (flesh this out more pls)
