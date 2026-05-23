FROM --platform=linux/amd64 webdevops/php-nginx:8.4

COPY api/ /app
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV DB_PATH=/tmp/database.sqlite

ENTRYPOINT ["/entrypoint.sh"]
