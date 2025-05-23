<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'space_id',
        'user_id',
        'start_time',
        'end_time',
        'status'
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    // Estados posibles de una reserva
    const STATUS_PENDING = 'pending';
    const STATUS_COMPLETED = 'completed';

    public static $statuses = [
        self::STATUS_PENDING => 'Pendiente',
        self::STATUS_COMPLETED => 'Completada',
    ];

    /**
     * Relación con el espacio reservado
     */
    public function space()
    {
        return $this->belongsTo(Space::class);
    }

    /**
     * Relación con el usuario que hizo la reserva
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Verificar si la reserva está en curso
     */
    public function isCurrent(): bool
    {
        $now = now();
        return $this->start_time <= $now && $this->end_time >= $now;
    }

    /**
     * Verificar si la reserva es pasada
     */
    public function isPast(): bool
    {
        return $this->end_time < now();
    }

    /**
     * Verificar si la reserva es futura
     */
    public function isUpcoming(): bool
    {
        return $this->start_time > now();
    }

    /**
     * Obtener la duración en horas
     */
    public function getDurationInHours(): float
    {
        return $this->start_time->diffInHours($this->end_time);
    }

    /**
     * Scope para reservas pasadas
     */
    public function scopePast($query)
    {
        return $query->where('end_time', '<', now());
    }

    /**
     * Scope para reservas futuras
     */
    public function scopeUpcoming($query)
    {
        return $query->where('start_time', '>', now());
    }

    /**
     * Scope para reservas en curso
     */
    public function scopeCurrent($query)
    {
        $now = now();
        return $query->where('start_time', '<=', $now)
                    ->where('end_time', '>=', $now);
    }

    /**
     * Scope para reservas de un espacio específico
     */
    public function scopeForSpace($query, $spaceId)
    {
        return $query->where('space_id', $spaceId);
    }

    /**
     * Scope para reservas de un usuario específico
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Verificar si hay solapamiento con otra reserva
     */
    public function overlapsWith($startTime, $endTime): bool
    {
        return Booking::where('space_id', $this->space_id)
            ->where('id', '!=', $this->id)
            ->where(function($query) use ($startTime, $endTime) {
                $query->where(function($q) use ($startTime, $endTime) {
                    $q->where('start_time', '<', $endTime)
                      ->where('end_time', '>', $startTime);
                });
            })
            ->exists();
    }
}