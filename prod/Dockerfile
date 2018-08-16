ARG tag=latest

# BUILDER
FROM registry.gitlab.com/lucaspickering/battletrack/frontend:$tag as builder
RUN npm run build


# NGINX SERVER
FROM nginx-amplify:latest

# Copy in config and build files
COPY . /battletrack/
COPY --from=builder /battletrack/build/ /battletrack/build/

CMD sh -c "sleep 5 && nginx -c /battletrack/nginx.conf -g 'daemon off;'"
