<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Booking extends Model
{
    protected $fillable = [
        'user_id', 'screening_id', 'reference', 'status',
        'total_pence', 'held_until', 'confirmed_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => BookingStatus::class,
            'held_until' => 'immutable_datetime',
            'confirmed_at' => 'immutable_datetime',
            'total_pence' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function screening(): BelongsTo
    {
        return $this->belongsTo(Screening::class);
    }

    public function seats(): HasMany
    {
        return $this->hasMany(BookingSeat::class);
    }
}
