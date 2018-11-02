# Battletrack
Website for viewing PUBG match history, and analyzing the events that occurred throughout a match.

## Development
### Setup
1. Install Docker and Docker Compose
1. `git submodule init && git submodule update`
1. [OPTIONAL] Set up git hooks by running `bin/hooks.py`
1. Save the following keys in the `keys/` directory as needed:
    1. `pubg` - PUBG API key
    1. `amplify` - Nginx Amplify key
    1. `gitlab` - Gitlab token
1. `cd frontend && npm install`

### Running
```
bin/dev.sh up
```

### Migrations
```
bin/dev.sh run backend ./manage.py makemigrations
bin/dev.sh run backend ./manage.py migrate
```

### Updating Assets
```
frontend/assets.py pull
frontend/assets.py update
```

### Testing
```
bin/dev.sh run backend ./manage.py test
bin/dev.sh run frontend npm run test
```

### Docker Registry
You can push to/pull from the docker registry by logging in with:  
`docker login -u <gitlab_user> -p $(cat keys/gitlab) registry.gitlab.com`

## Production
### Creating a new swarm manager
1. Install Docker
1. [Set up remote docker access with TLS](https://github.com/IcaliaLabs/guides/wiki/Deploy-and-Secure-a-Remote-Docker-Engine)
1. `mkdir -p /var/log/battletrack /var/lib/postgresql/data`
1. Add it to the swarm (flesh this out more pls)
