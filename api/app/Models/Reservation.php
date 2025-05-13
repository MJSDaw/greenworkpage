<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */    protected $fillable = [
        'user_id',
        'space_id',
        'reservation_period',
    ];    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        // No casting needed for reservation_period as it will remain a string
    ];

    /**
     * Indicates if the model's ID is auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;    /**
     * The primary key for the model.
     *
     * @var array
     */
    protected $primaryKey = ['user_id', 'space_id', 'reservation_period'];

    /**
     * Get the user that owns the reservation.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }    /**
     * Get the space that is reserved.
     */
    public function space()
    {
        return $this->belongsTo(Space::class);
    }
    
    /**
     * Get the start date from the reservation period.
     *
     * @return string
     */
    public function getStartDate()
    {
        $dates = explode('|', $this->reservation_period);
        return $dates[0] ?? null;
    }
    
    /**
     * Get the end date from the reservation period.
     *
     * @return string
     */
    public function getEndDate()
    {
        $dates = explode('|', $this->reservation_period);
        return $dates[1] ?? null;
    }
}
