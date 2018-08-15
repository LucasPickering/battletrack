ARG tag=latest

# BUILDER
FROM registry.gitlab.com/lucaspickering/battletrack/frontend:$tag as builder
RUN npm run build


# NGINX SERVER
FROM nginx:alpine

RUN wget -O - https://raw.githubusercontent.com/nginxinc/nginx-amplify-agent/master/packages/install-source.sh | sh

# Copy in config and build files
COPY . /battletrack/
COPY --from=builder /battletrack/build/ /battletrack/build/

CMD sh -c "sleep 5 && nginx -c /battletrack/nginx.conf -g 'daemon off;'"
