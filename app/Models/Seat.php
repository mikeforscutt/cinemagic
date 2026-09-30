<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Seat extends Model
{
    protected $fillable = [
        'screen_id', 'row_label', 'seat_number', 'type', 'position_x', 'position_y',
    ];

    protected function casts(): array
    {
        return [
            'type' => SeatType::class,
            'seat_number' => 'integer',
            'position_x' => 'integer',
            'position_y' => 'integer',
        ];
    }

    public function screen(): BelongsTo
    {
        return $this->belongsTo(Screen::class);
    }

    /** e.g. "H12" */
    protected function label(): Attribute
    {
        return Attribute::get(fn () => $this->row_label.$this->seat_number);
    }
}
