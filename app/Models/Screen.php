<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Screen extends Model
{
    protected $fillable = ['name'];

    public function seats(): HasMany
    {
        return $this->hasMany(Seat::class);
    }

    public function screenings(): HasMany
    {
        return $this->hasMany(Screening::class);
    }
}
