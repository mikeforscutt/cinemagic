<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Screening extends Model
{
    protected $fillable = ['film_id', 'screen_id', 'starts_at', 'base_price_pence'];

    protected function casts(): array
    {
        return [
            'starts_at' => 'immutable_datetime',
            'base_price_pence' => 'integer',
        ];
    }

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
}
