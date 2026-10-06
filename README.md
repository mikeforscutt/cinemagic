# Cinemagic

A cinema ticket booking app with an interactive seat picker.

**Live demo:** https://cinemagic-0ru7.onrender.com

> Hosted on a free tier, so the first request after a period of inactivity takes
> 30–50 seconds while the instance wakes up.
>
> Demo account: `demo@cinemagic.test` / `password`

Browse what's on by day, pick a screening, choose your seats off a map of the
auditorium, and book. Seats are held for ten minutes while you check out, then
released if you don't confirm.

---

## The interesting problem

Two people click the same seat at the same moment. Only one can have it.

Three things handle this between them:

**1. A unique constraint on `(screening_id, seat_id)`**

This is the only part that actually guarantees anything, because Postgres
enforces it regardless of what the application code does. Everything else exists
to turn a constraint violation into a graceful error rather than a 500.

```php
$table->unique(['screening_id', 'seat_id']);
```

**2. A transaction with row locking**

When a booking is confirmed, concurrent requests queue rather than race:

```php
DB::transaction(function () use ($screening, $seatIds) {
    $taken = BookingSeat::query()
        ->where('screening_id', $screening->id)
        ->whereIn('seat_id', $seatIds)
        ->lockForUpdate()
        ->exists();

    if ($taken) {
        throw SeatUnavailableException::taken();
    }

    // create the booking and its seat rows
});
```

**3. Time-limited holds**

Selecting seats creates rows with a `held_until` timestamp rather than
confirming immediately, so an abandoned checkout doesn't lock seats forever.
Expired holds are released whenever availability is read, which avoids needing a
scheduled worker — relevant on free hosting, where background workers cost money.

### The part that caught me out

`lockForUpdate` locks rows that _exist_. When two requests both want a seat
nobody has booked yet, there are no rows to lock, so both pass the check and
both attempt the insert. The unique constraint rejects whichever lands second,
and that violation is caught and converted:

```php
} catch (QueryException $e) {
    if ($e->getCode() === '23505') {
        throw SeatUnavailableException::taken();
    }

    throw $e;
}
```

So the lock reduces contention and the constraint provides correctness. There's
a test that bypasses the service entirely and inserts straight into the database,
to prove the guarantee holds even if the application logic is wrong.

---

## Features

- **Browsing** — homepage with a featured film, now showing and most popular;
  listings filtered by day; individual film pages
- **Seat map** — rendered from stored grid coordinates, so screens can have
  aisles, premium rows and wheelchair spaces rather than a uniform block
- **Booking** — ten-minute holds with a live countdown, confirm and cancel, a
  per-user bookings history, booking references
- **Pricing** — seat-type surcharges and ticket-type multipliers, calculated
  server side; the UI displays prices rather than computing them
- **Accounts** — registration, login, password reset, passkeys and two-factor
- **Accessibility** — the seat map is keyboard navigable, with each seat
  labelled by row, number, type and price

---

## Stack

|            |                                                         |
| ---------- | ------------------------------------------------------- |
| Backend    | Laravel 12, PHP 8.4                                     |
| Frontend   | Inertia 2, React 19, TypeScript, Tailwind 4             |
| Database   | PostgreSQL 18                                           |
| Tests      | Pest 4                                                  |
| CI         | GitHub Actions — Pint, ESLint, TypeScript, build, tests |
| Production | FrankenPHP in Docker on Render, Neon Postgres           |

PostgreSQL is used in development, test and production rather than SQLite
locally, because the booking logic depends on row-level locking behaviour that
SQLite doesn't implement the same way. Tests that pass on SQLite would give
false confidence about the exact thing this project is demonstrating.

---

## Running locally

Requires PHP 8.4, Node 22, Composer and PostgreSQL.

```bash
git clone git@github.com:mikeforscutt/cinemagic.git
cd cinemagic

composer install
npm install

cp .env.example .env
php artisan key:generate

createdb cinemagic
createdb cinemagic_test

# Set DB_USERNAME and DB_PASSWORD in .env to match your local Postgres
php artisan migrate --seed
```

Then run the dev server and Vite in separate terminals:

```bash
php artisan serve
npm run dev
```

### Tests

```bash
cp .env.example .env.testing   # set DB_DATABASE=cinemagic_test
php artisan test
```

---

## Notes and known gaps

- **Seat availability doesn't poll.** If someone books a seat while you're
  looking at the map, you find out when you submit rather than live. The error
  path handles it correctly; the UI just isn't optimistic about it. Live updates
  over WebSockets would be the next step.
- **No admin area yet.** Films, screenings and screens are seeded. User roles
  and management are the next piece of work.
- **Film data is invented.** Titles, synopses and cast are generated rather than
  real, to avoid depending on a third-party film API. Poster images are from
  [Unsplash](https://unsplash.com).
- **Ticket pricing** applies the type multiplier after the seat surcharge, so a
  child ticket in a premium seat is 60% of the premium price rather than 60% of
  base plus the full surcharge. A judgement call rather than an obvious answer.

---

## Deployment

The production image is a multi-stage Docker build on FrankenPHP. Three things
broke in production that never surfaced locally, all worth knowing about:

- The container runs as a non-root user, and the FrankenPHP binary ships with
  `cap_net_bind_service` set. Render's sandbox refuses to exec a file carrying
  file capabilities, so they're stripped at build time.
- `storage` and `bootstrap/cache` need to be writable by whatever UID the
  platform assigns, which isn't `www-data`.
- Render terminates TLS at its edge and forwards over plain HTTP, so Laravel
  generated `http://` asset URLs on an HTTPS page and the browser blocked every
  one as mixed content. Fixed by trusting the proxy.

Config, routes and views are cached at container start rather than at build
time, because config caching bakes in environment variables and those are only
injected at runtime.
