# Cinemagic

A cinema ticket booking app with an interactive seat picker and an admin area.

**Live demo:** https://cinemagic-0ru7.onrender.com

> Hosted on a free tier, so the first request after a period of inactivity takes
> 30–50 seconds while the instance wakes up.
>
> Customer account: `demo@cinemagic.test` / `password`
> Admin account: `admin@cinemagic.test` / `password`

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

## The other interesting problem: times

A cinema schedule is the kind of thing timezones quietly ruin.

Everything is stored in UTC. Admins enter showtimes in `Europe/London`, and the
conversion happens in exactly one place — `ScreeningRequest::startsAt()` — rather
than being scattered through controllers:

```php
public function startsAt(): CarbonImmutable
{
    return CarbonImmutable::parse(
        (string) $this->input('starts_at'),
        Screening::TIMEZONE,
    )->utc();
}
```

Two tests cover it: one in July, one in January. That matters because an
implementation which ignores timezones altogether passes the January test and
fails the July one. Without both, the bug waits until the clocks change and then
shifts every showtime by an hour.

The front end pins display to `Europe/London` explicitly rather than using the
viewer's zone, so the schedule reads in cinema time wherever it's opened.

Models also serialise dates with `toAtomString()`, so JavaScript receives an
offset rather than a naive timestamp it would otherwise interpret as local.

---

## Features

### Customer

- **Browsing** — homepage with a featured film, now showing and most popular;
  listings filtered by day; individual film pages
- **Seat map** — rendered from stored grid coordinates, so screens can have
  aisles, premium rows and wheelchair spaces rather than a uniform block
- **Live availability** — the map re-checks every 15 seconds via an Inertia
  partial reload. If a seat you've picked goes, it's dropped from your selection
  and named, rather than failing when you submit
- **Booking** — ten-minute holds with a live countdown, confirm and cancel, a
  per-user bookings history, booking references
- **Pricing** — seat-type surcharges and ticket-type multipliers, calculated
  server side; the UI displays prices rather than computing them
- **Accounts** — registration, login, password reset, passkeys and two-factor

### Admin

- **Dashboard** — 30-day revenue and booking counts, today's screenings with
  occupancy, most-booked films
- **Films** — full CRUD; a film with screenings can't be deleted
- **Screenings** — scheduling with overlap validation. A screening occupies its
  screen for the film's runtime plus a 15 minute turnaround, so back-to-back
  showings are allowed but clashes are rejected, naming the conflicting film.
  A screening with bookings can be neither moved nor removed
- **Users** — create, edit, delete, and change roles. Nobody can change their own
  role or delete their own account from the admin area

Authorisation is policy-based throughout, with middleware gating the area and
policies deciding individual actions. `role` is deliberately not mass assignable,
so a crafted registration POST can't make an admin.

### Accessibility

- The seat map is keyboard navigable, each seat labelled by row, number, type
  and price
- Unavailable seats use `aria-disabled` rather than `disabled`, so they still
  respond to being tapped and can explain why they're refused — a `disabled`
  button swallows the event entirely
- All animation is switched off under `prefers-reduced-motion`

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

- **Screens aren't manageable.** Films and screenings can be managed through the
  admin area; screens and their seat layouts come from the seeder. Adding a
  fourth screen means a database change. Defensible on the grounds that screens
  are physical and rarely change, but it's a gap.
- **Abandoned holds are cleaned lazily.** `releaseExpiredHolds()` runs when
  availability is read, so a screening nobody visits keeps its expired holds
  until someone looks. A scheduled task would be tidier; free hosting doesn't
  run one.
- **Mail goes to the log driver.** No provider is configured, so password reset
  emails are written to `storage/logs` rather than sent. Email verification is
  deliberately disabled so new accounts aren't stranded.
- **Film data is invented.** Titles, synopses and cast are generated rather than
  real, to avoid depending on a third-party film API. Poster images are from
  [Unsplash](https://unsplash.com).
- **Ticket pricing** applies the type multiplier after the seat surcharge, so a
  child ticket in a premium seat is 60% of the premium price rather than 60% of
  base plus the full surcharge. A judgement call rather than an obvious answer.
- **Polling, not pushing.** Seat availability refreshes on a timer. WebSockets
  would be live rather than near-live, but need a running server that free
  hosting doesn't provide.

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
