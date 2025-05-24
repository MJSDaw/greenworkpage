<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Space extends Model
{
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'places',
        'price',
        'schedule',
        'images',
        'description',
        'subtitle',
        'address',
        'services',
    ];

    /**
     * Get the reservations for the space.
     */
    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
}
