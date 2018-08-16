# BUILDER
ARG tag=latest
FROM registry.gitlab.com/lucaspickering/battletrack/frontend:$tag as builder
RUN npm run build


# NGINX SERVER
FROM registry.gitlab.com/lucaspickering/battletrack/nginx-amplify:latest

# Copy in config and build files
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /battletrack/build/ /battletrack/build/
