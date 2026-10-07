<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Screening extends Model
{
    use HasFactory;

    /**
     * The cinema's local timezone. Times are entered and displayed in this
     * zone and stored in UTC.
     */
    public const TIMEZONE = 'Europe/London';

    /**
     * Minutes a screen needs between films for cleaning and turnaround.
     */
    public const TURNAROUND_MINUTES = 15;

    protected $fillable = [
        'film_id',
        'screen_id',
        'starts_at',
        'base_price_pence',
    ];

    public function film(): BelongsTo
    {
        return $this->belongsTo(Film::class);
    }

    public function screen(): BelongsTo
    {
        return $this->belongsTo(Screen::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function bookingSeats(): HasMany
    {
        return $this->hasMany(BookingSeat::class);
    }

    protected function casts(): array
    {
        return [
            'starts_at' => 'immutable_datetime',
            'base_price_pence' => 'integer',
        ];
    }

    /**
     * Send dates to the browser as ISO 8601 with an offset, so JavaScript
     * parses them unambiguously rather than assuming local time.
     */
    protected function serializeDate(DateTimeInterface $date): string
    {
        return $date->toAtomString();
    }
}
