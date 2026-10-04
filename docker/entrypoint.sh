#!/bin/sh
set -e

php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

export SERVER_NAME=":${PORT:-8000}"

exec frankenphp php-server --root /app/public --listen "0.0.0.0:${PORT:-8000}"