<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Film extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'synopsis',
        'runtime_minutes',
        'certificate',
        'release_date',
        'director',
        'genres',
        'cast_list',
        'poster_path',
    ];

    public function screenings(): HasMany
    {
        return $this->hasMany(Screening::class);
    }

    /**
     * Every booking made against any screening of this film.
     */
    public function bookings(): HasManyThrough
    {
        return $this->hasManyThrough(Booking::class, Screening::class);
    }

    protected function casts(): array
    {
        return [
            'release_date' => 'date',
            'genres' => 'array',
            'cast_list' => 'array',
            'runtime_minutes' => 'integer',
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