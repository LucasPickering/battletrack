FROM nginx:alpine

COPY . /battletrack/

CMD sh -c "sleep 5 && nginx -c /battletrack/nginx.conf -g 'daemon off;'"
