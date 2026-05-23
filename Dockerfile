FROM --platform=linux/amd64 webdevops/php-nginx:8.4

COPY api/ /app

RUN php /app/seed.php
