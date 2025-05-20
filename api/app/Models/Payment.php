<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'user_reservation_id',
        'space_reservation_id',
        'reservation_period',
        'amount',
        'status',
        'payment_method',
        'payment_date',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'payment_date' => 'datetime',
        'amount' => 'decimal:2',
    ];

    /**
     * Get the user that made the payment.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the reservation this payment is for.
     */
    public function reservation()
    {
        return $this->belongsTo(Reservation::class, 'user_reservation_id', 'user_id')
            ->where('space_id', $this->space_reservation_id)
            ->where('reservation_period', $this->reservation_period);
    }
}
