#!/bin/bash
set -e

php /app/seed.php
chmod 666 "${DB_PATH:-/tmp/database.sqlite}"

exec /opt/docker/bin/entrypoint.sh supervisord
