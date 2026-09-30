<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingSeat extends Model
{
    protected $fillable = [
        'booking_id', 'screening_id', 'seat_id', 'ticket_type', 'price_pence',
    ];

    protected function casts(): array
    {
        return [
            'ticket_type' => TicketType::class,
            'price_pence' => 'integer',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function seat(): BelongsTo
    {
        return $this->belongsTo(Seat::class);
    }

    public function screening(): BelongsTo
    {
        return $this->belongsTo(Screening::class);
    }
}
