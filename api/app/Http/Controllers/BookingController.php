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
            ->where(function ($query) use ($startTime, $endTime) {
                $query->where(function ($q) use ($startTime, $endTime) {
                    $q->where('start_time', '<', $endTime)
                        ->where('end_time', '>', $startTime);
                });
            })
            ->exists();

        if ($overlapping) {
            return response()->json([
                'errors' => [
                    'time' => 'timeConflict'
                ]
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

        try {
            // Crear el contenido del correo de confirmación
            $to = $user->email;
            $subject = 'Confirmación de Reserva';
            
            // Crear formato HTML para el correo
            $htmlMessage = "
            <html>
            <body>
                <h2>Confirmación de Reserva</h2>
                <p>Hola <strong>{$user->name}</strong>,</p>
                <p>Tu reserva ha sido confirmada con los siguientes detalles:</p>
                <ul>
                    <li><strong>Espacio:</strong> {$booking->space->subtitle}</li>
                    <li><strong>Inicio:</strong> {$booking->start_time}</li>
                    <li><strong>Fin:</strong> {$booking->end_time}</li>
                </ul>
                <p>¡Gracias por reservar con nosotros!</p>
            </body>
            </html>";

            // Registrar en el log el intento de envío
            $logPath = storage_path('logs/mail_debug.log');
            file_put_contents($logPath, date('Y-m-d H:i:s') . " - Intentando enviar correo a: {$to}\n", FILE_APPEND);
            
            // Usar el servicio PythonMailer en lugar de la función mail()
            $mailer = new \App\Services\PythonMailer();
            $result = $mailer->sendMail($to, $subject, $htmlMessage);
            
            // Registrar el resultado
            if ($result['status'] === 'success') {
                file_put_contents($logPath, date('Y-m-d H:i:s') . " - Correo de confirmación enviado exitosamente.\n", FILE_APPEND);
            } else {
                throw new \Exception("Error al enviar correo: " . ($result['message'] ?? 'Sin detalles'));
            }
        } catch (\Exception $e) {
            // Registrar el error
            $errorMessage = 'Error al enviar el correo: ' . $e->getMessage() . "\n" . $e->getTraceAsString();
            file_put_contents(storage_path('logs/mail_error.log'), date('Y-m-d H:i:s') . " - $errorMessage\n", FILE_APPEND);
        }

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
            'status' => 'in:pending,confirmed,cancelled,completed',
            'space_id' => 'sometimes|exists:spaces,id',
            'user_id' => 'sometimes|exists:users,id'
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

            // Use the new space_id if provided, otherwise use the existing one
            $spaceId = $request->has('space_id') ? $request->space_id : $booking->space_id;

            $overlapping = Booking::where('space_id', $spaceId)
                ->where('id', '!=', $booking->id)
                ->where(function ($query) use ($startTime, $endTime) {
                    $query->where(function ($q) use ($startTime, $endTime) {
                        $q->where('start_time', '<', $endTime)
                            ->where('end_time', '>', $startTime);
                    });
                })
                ->exists();

            if ($overlapping) {
                return response()->json([
                    'errors' => [
                        'time' => 'timeConflict'
                    ]
                ], 409);
            }

            $booking->start_time = $startTime;
            $booking->end_time = $endTime;
        }

        // Actualizar space_id si está presente
        if ($request->has('space_id')) {
            $booking->space_id = $request->space_id;
        }

        // Actualizar user_id si está presente
        if ($request->has('user_id')) {
            $booking->user_id = $request->user_id;
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

        // Si se pasa un parámetro booking_id, devolver solo esa reserva en formato paginado
        if ($request->has('booking_id')) {
            $booking = Booking::with(['space'])
                ->where('user_id', $user->id)
                ->where('id', $request->booking_id)
                ->first();
            
            return response()->json([
                'current_page' => 1,
                'data' => $booking ? [$booking] : [],
                'from' => $booking ? 1 : null,
                'last_page' => 1,
                'per_page' => 1,
                'to' => $booking ? 1 : null,
                'total' => $booking ? 1 : 0,
            ]);
        }

        // Obtener todas las reservas del usuario con paginación
        $bookings = Booking::with(['space'])
            ->where('user_id', $user->id)
            ->orderBy('start_time', 'asc')
            ->paginate($perPage);

        // Asegurar que la respuesta tenga un formato consistente
        $formattedResponse = [
            'current_page' => $bookings->currentPage(),
            'data' => $bookings->items(),
            'from' => $bookings->firstItem(),
            'last_page' => $bookings->lastPage(),
            'per_page' => $bookings->perPage(),
            'to' => $bookings->lastItem(),
            'total' => $bookings->total(),
        ];

        return response()->json($formattedResponse);
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
