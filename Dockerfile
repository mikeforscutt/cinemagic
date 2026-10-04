# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# PHP dependencies. Copying the application code in means the autoloader can
# be optimised here once, rather than again in every later stage.
# ---------------------------------------------------------------------------
FROM composer:2 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./
COPY app ./app
COPY bootstrap ./bootstrap
COPY config ./config
COPY database ./database
COPY routes ./routes

RUN composer install \
    --no-dev \
    --no-scripts \
    --optimize-autoloader \
    --prefer-dist \
    --ignore-platform-reqs

# ---------------------------------------------------------------------------
# Front-end assets. This needs PHP as well as Node, because the Wayfinder Vite
# plugin runs an artisan command to generate typed routes, which boots Laravel.
# ---------------------------------------------------------------------------
FROM dunglas/frankenphp:php8.4-alpine AS assets

RUN apk add --no-cache nodejs npm \
    && install-php-extensions pdo_pgsql bcmath

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
COPY --from=vendor /app/vendor ./vendor

# Laravel needs an APP_KEY to boot. This one is build-time only and is thrown
# away with the stage; the running container gets its key from the environment.
RUN cp .env.example .env \
    && php artisan key:generate \
    && npm run build

# ---------------------------------------------------------------------------
# Final image.
# ---------------------------------------------------------------------------
FROM dunglas/frankenphp:php8.4-alpine

# The FrankenPHP binary ships with cap_net_bind_service set so it can bind
# port 80 as a non-root user. Render's sandbox refuses to exec a file carrying
# file capabilities, so strip them: the app binds $PORT, which is unprivileged.
RUN install-php-extensions pdo_pgsql bcmath opcache \
    && (setcap -r /usr/local/bin/frankenphp 2>/dev/null || true)

WORKDIR /app

COPY . .
COPY --from=vendor /app/vendor ./vendor
COPY --from=assets /app/public/build ./public/build

RUN chown -R www-data:www-data storage bootstrap/cache
RUN chmod -R 777 storage bootstrap/cache

COPY docker/entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint

ENTRYPOINT ["entrypoint"]