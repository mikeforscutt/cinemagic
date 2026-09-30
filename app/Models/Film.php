<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Film extends Model
{
    protected $fillable = [
        'title', 'slug', 'synopsis', 'runtime_minutes', 'certificate',
        'release_date', 'director', 'genres', 'cast_list', 'poster_path',
    ];

    protected function casts(): array
    {
        return [
            'release_date' => 'date',
            'genres' => 'array',
            'cast_list' => 'array',
            'runtime_minutes' => 'integer',
        ];
    }

    public function screenings(): HasMany
    {
        return $this->hasMany(Screening::class);
    }
}
