<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ReservationController extends Controller
{
    /**
     * Display a listing of the reservations.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $reservations = Reservation::with(['user', 'space'])->get();
        
        return response()->json([
            'success' => true,
            'data' => $reservations
        ]);
    }

    /**
     * Store a newly created reservation in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'space_id' => 'required|exists:spaces,id',
            'start_date' => 'required|date_format:Y-m-d H:i',
            'end_date' => 'required|date_format:Y-m-d H:i|after:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Create reservation period string
        $reservationPeriod = $request->start_date . '|' . $request->end_date;

        // Check if reservation already exists
        $existingReservation = Reservation::where([
            'user_id' => Auth::id(),
            'space_id' => $request->space_id,
            'reservation_period' => $reservationPeriod
        ])->first();

        if ($existingReservation) {
            return response()->json([
                'success' => false,
                'message' => 'You already have a reservation for this space during this period'
            ], 422);
        }

        // Create new reservation
        $reservation = Reservation::create([
            'user_id' => Auth::id(),
            'space_id' => $request->space_id,
            'reservation_period' => $reservationPeriod
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Reservation created successfully',
            'data' => $reservation
        ], 201);
    }
}
