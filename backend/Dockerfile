FROM python:3-alpine

ENV PYTHONUNBUFFERED=1

RUN apk add --no-cache \
    gcc \
    libmagic \
    libpq \
    linux-headers \
    musl-dev \
    openssl \
    postgresql-dev \
    yaml-dev \
    zlib-dev

ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

WORKDIR /battletrack/

COPY requirements.txt .
RUN pip install -U -r requirements.txt
COPY . .
