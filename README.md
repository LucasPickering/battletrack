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
`docker-compose run backend ./manage.py test`
`docker-compose run -e CI=true frontend npm test`
