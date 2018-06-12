# Battletrack
PUBG map stuff

## Development Setup
### Back End
1. Install Python 3.6+ and an associated pip (commands assume `python3` and `pip3`)
1. Install PostgreSQL - this is platform specific
1. Refer to [this page](https://www.digitalocean.com/community/tutorials/how-to-use-postgresql-with-your-django-application-on-ubuntu-14-04)
    to configure PostgreSQL. Use the following settings:
    1. Database name: `battletrack`
    1. User: `btuser`
    1. Password: `btpassword`

    Pro tip: Make sure your Postgres instance isn't accessible outside your machine.
1. Do this stuff:
```
cd backend
sudo pip3 install -r requirements.txt
python3 manage.py migrate
```
**Run with** `python3 manage.py runserver`

### Front End
1. Install Node.js/npm
2. Do this stuff:
```
git submodule init
git submodule update`
cd frontend
npm install
```
**Run with** `npm start`
