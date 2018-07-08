# Battletrack
PUBG map stuff

## Development
### Setup
1. Install Docker and Docker Compose
1. Save your API key to `key.sh`
1. [OPTIONAL] Set up git hooks with `bin/hooks.py`
1. Run:
    * `cd frontend && npm install`
    * `source key.sh`
    * `bin/dev.sh up`

### Migrations
```
bin/dev.sh makemigrations
bin/dev.sh migrate
```

### Testing
```
bin/dev.sh testback
bin/dev.sh testfront
```

## Production
### Creating a new swarm manager
1. Install Docker
1. [Set up remote docker access with TLS](https://github.com/IcaliaLabs/guides/wiki/Deploy-and-Secure-a-Remote-Docker-Engine)
1. `mkdir -p /var/log/battletrack /var/lib/postgresql`
1. Add it to the swarm (flesh this out more pls)
