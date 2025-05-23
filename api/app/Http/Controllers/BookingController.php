<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Space;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class BookingController extends Controller
{
    /**
     * Mostrar todas las reservas con paginación
     */
    public function index(Request $request)
    {
        $perPage = $request->per_page ?? 3; // Default 3 items per page
        
        $bookings = Booking::with(['space', 'user'])
                    ->orderBy('start_time', 'asc')
                    ->paginate($perPage);
        
        return response()->json($bookings);
    }

    /**
     * Obtener reservas pasadas (ya han ocurrido) con paginación
     */
    public function pastBookings(Request $request)
    {
        $now = Carbon::now();
        $perPage = $request->per_page ?? 3; // Default 3 items per page
        
        $pastBookings = Booking::with(['space', 'user'])
                        ->where('end_time', '<', $now)
                        ->orderBy('start_time', 'desc')
                        ->paginate($perPage);
        
        return response()->json($pastBookings);
    }

    /**
     * Obtener reservas futuras (aún no han ocurrido) con paginación
     */
    public function upcomingBookings(Request $request)
    {
        $now = Carbon::now();
        $perPage = $request->per_page ?? 3; // Default 3 items per page
        
        $upcomingBookings = Booking::with(['space', 'user'])
                            ->where('start_time', '>', $now)
                            ->orderBy('start_time', 'asc')
                            ->paginate($perPage);
        
        return response()->json($upcomingBookings);
    }

    /**
     * Crear una nueva reserva
     */
    public function store(Request $request)
    {
        // Validar los datos de entrada
        $validator = Validator::make($request->all(), [
            'space_id' => 'required|exists:spaces,id',
            'start_time' => 'required|date|after_or_equal:now',
            'end_time' => 'required|date|after:start_time',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        // Obtener el usuario autenticado
        $user = Auth::user();
        
        // Convertir fechas a objetos Carbon para manipulación
        $startTime = Carbon::parse($request->start_time);
        $endTime = Carbon::parse($request->end_time);

        // Verificar que la duración no exceda un límite (opcional)
        $maxHours = 24; // Máximo 24 horas por reserva
        if ($endTime->diffInHours($startTime) > $maxHours) {
            return response()->json([
                'message' => "La reserva no puede exceder las {$maxHours} horas"
            ], 422);
        }

        // Verificar solapamiento con otras reservas
        $overlapping = Booking::where('space_id', $request->space_id)
            ->where(function($query) use ($startTime, $endTime) {
                $query->where(function($q) use ($startTime, $endTime) {
                    $q->where('start_time', '<', $endTime)
                      ->where('end_time', '>', $startTime);
                });
            })
            ->exists();

        if ($overlapping) {
            return response()->json([
                'message' => 'El espacio ya está reservado en ese horario'
            ], 409);
        }

        // Crear la reserva
        $booking = Booking::create([
            'space_id' => $request->space_id,
            'user_id' => $user->id,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'status' => 'confirmed' // Estado por defecto
        ]);

        return response()->json([
            'message' => 'Reserva creada exitosamente',
            'data' => $booking->load(['space', 'user'])
        ], 201);
    }

    /**
     * Mostrar una reserva específica
     */
    public function show($id)
    {
        $booking = Booking::with(['space', 'user'])->find($id);
        
        if (!$booking) {
            return response()->json([
                'message' => 'Reserva no encontrada'
            ], 404);
        }

        return response()->json($booking);
    }

    /**
     * Actualizar una reserva
     */
    public function update(Request $request, $id)
    {
        $booking = Booking::find($id);
        
        if (!$booking) {
            return response()->json([
                'message' => 'Reserva no encontrada'
            ], 404);
        }

        // Validar los datos de entrada
        $validator = Validator::make($request->all(), [
            'start_time' => 'date|after_or_equal:now',
            'end_time' => 'date|after:start_time',
            'status' => 'in:pending,confirmed,cancelled,completed'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verificar solapamiento si se actualiza el horario
        if ($request->has(['start_time', 'end_time'])) {
            $startTime = Carbon::parse($request->start_time);
            $endTime = Carbon::parse($request->end_time);

            $overlapping = Booking::where('space_id', $booking->space_id)
                ->where('id', '!=', $booking->id)
                ->where(function($query) use ($startTime, $endTime) {
                    $query->where(function($q) use ($startTime, $endTime) {
                        $q->where('start_time', '<', $endTime)
                          ->where('end_time', '>', $startTime);
                    });
                })
                ->exists();

            if ($overlapping) {
                return response()->json([
                    'message' => 'El espacio ya está reservado en ese horario'
                ], 409);
            }

            $booking->start_time = $startTime;
            $booking->end_time = $endTime;
        }

        // Actualizar otros campos si están presentes
        if ($request->has('status')) {
            $booking->status = $request->status;
        }

        $booking->save();

        return response()->json([
            'message' => 'Reserva actualizada exitosamente',
            'data' => $booking->load(['space', 'user'])
        ]);
    }

    /**
     * Eliminar una reserva
     */
    public function destroy($id)
    {
        $booking = Booking::find($id);
        
        if (!$booking) {
            return response()->json([
                'message' => 'Reserva no encontrada'
            ], 404);
        }

        $booking->delete();

        return response()->json([
            'message' => 'Reserva eliminada exitosamente'
        ]);
    }

    /**
     * Obtener reservas del usuario autenticado con paginación
     */
    public function userBookings(Request $request)
    {
        $user = Auth::user();
        $perPage = $request->per_page ?? 3; // Default 3 items per page
        
        $bookings = Booking::with(['space'])
                    ->where('user_id', $user->id)
                    ->orderBy('start_time', 'asc')
                    ->paginate($perPage);
        
        return response()->json($bookings);
    }

    /**
     * Obtener reservas pasadas del usuario autenticado con paginación
     */
    public function userPastBookings(Request $request)
    {
        $user = Auth::user();
        $now = Carbon::now();
        $perPage = $request->per_page ?? 3; // Default 3 items per page
        
        $pastBookings = Booking::with(['space'])
                        ->where('user_id', $user->id)
                        ->where('end_time', '<', $now)
                        ->orderBy('start_time', 'desc')
                        ->paginate($perPage);
        
        return response()->json($pastBookings);
    }

    /**
     * Obtener reservas futuras del usuario autenticado con paginación
     */
    public function userUpcomingBookings(Request $request)
    {
        $user = Auth::user();
        $now = Carbon::now();
        $perPage = $request->per_page ?? 3; // Default 3 items per page
        
        $upcomingBookings = Booking::with(['space'])
                            ->where('user_id', $user->id)
                            ->where('start_time', '>', $now)
                            ->orderBy('start_time', 'asc')
                            ->paginate($perPage);
        
        return response()->json($upcomingBookings);
    }
}