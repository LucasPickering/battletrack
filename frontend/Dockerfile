FROM node:10-alpine

WORKDIR /battletrack/

# Do npm install first to prevent having to re-do it when package.json is unchanged
COPY package.json .
RUN npm install

# Copy everything else in
COPY . .
