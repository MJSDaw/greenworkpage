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
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $query = Reservation::with(['user', 'space']);
        
        // Filter by user_id
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        
        // Filter by space_id
        if ($request->has('space_id')) {
            $query->where('space_id', $request->space_id);
        }
        
        // Filter by date range (start_date or end_date)
        if ($request->has('start_date') || $request->has('end_date')) {
            $query->filterByDateRange($request->start_date, $request->end_date);
        }
        
        // Ordering
        $orderBy = $request->input('order_by', 'created_at');
        $orderDirection = $request->input('order_direction', 'desc');
        
        // Validate order_by to prevent SQL injection
        $allowedOrderColumns = ['created_at', 'updated_at', 'reservation_period'];
        if (!in_array($orderBy, $allowedOrderColumns)) {
            $orderBy = 'created_at';
        }
        
        // Validate order direction
        $orderDirection = strtolower($orderDirection) === 'asc' ? 'asc' : 'desc';
        
        // Apply ordering
        if ($orderBy === 'reservation_period') {
            // Order by the start date portion of reservation_period
            $query->orderByRaw("SUBSTRING_INDEX(reservation_period, '|', 1) $orderDirection");
        } else {
            $query->orderBy($orderBy, $orderDirection);
        }
        
        // Pagination
        $perPage = $request->input('per_page', 10);
        $reservations = $query->paginate($perPage);
        
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
            'start_date' => 'required|string',
            'end_date' => 'required|string',
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

    /**
     * Get reservations for the authenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function myReservations(Request $request)
    {
        $query = Reservation::with(['space'])
            ->where('user_id', Auth::id());
        
        // Filter by space_id if provided
        if ($request->has('space_id')) {
            $query->where('space_id', $request->space_id);
        }
        
        // Filter by date range
        $query->filterByDateRange($request->start_date, $request->end_date);
        
        // Ordering
        $orderBy = $request->input('order_by', 'reservation_period');
        $orderDirection = $request->input('order_direction', 'asc');
        
        // Validate order_by to prevent SQL injection
        $allowedOrderColumns = ['created_at', 'updated_at', 'reservation_period'];
        if (!in_array($orderBy, $allowedOrderColumns)) {
            $orderBy = 'reservation_period';
        }
        
        // Validate order direction
        $orderDirection = strtolower($orderDirection) === 'asc' ? 'asc' : 'desc';
        
        // Apply ordering
        if ($orderBy === 'reservation_period') {
            // Order by the start date portion of reservation_period
            $query->orderByRaw("SUBSTRING_INDEX(reservation_period, '|', 1) $orderDirection");
        } else {
            $query->orderBy($orderBy, $orderDirection);
        }
        
        // Pagination
        $perPage = $request->input('per_page', 10);
        $reservations = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $reservations
        ]);
    }
    
    /**
     * Get reservations for a specific space.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $spaceId
     * @return \Illuminate\Http\Response
     */
    public function spaceReservations(Request $request, $spaceId)
    {
        $query = Reservation::with(['user'])
            ->where('space_id', $spaceId);
            
        // Filter by date range
        $query->filterByDateRange($request->start_date, $request->end_date);
        
        // Ordering
        $orderBy = $request->input('order_by', 'reservation_period');
        $orderDirection = $request->input('order_direction', 'asc');
        
        // Validate order_by to prevent SQL injection
        $allowedOrderColumns = ['created_at', 'updated_at', 'reservation_period'];
        if (!in_array($orderBy, $allowedOrderColumns)) {
            $orderBy = 'reservation_period';
        }
        
        // Validate order direction
        $orderDirection = strtolower($orderDirection) === 'asc' ? 'asc' : 'desc';
        
        // Apply ordering
        if ($orderBy === 'reservation_period') {
            // Order by the start date portion of reservation_period
            $query->orderByRaw("SUBSTRING_INDEX(reservation_period, '|', 1) $orderDirection");
        } else {
            $query->orderBy($orderBy, $orderDirection);
        }
        
        // Pagination
        $perPage = $request->input('per_page', 10);
        $reservations = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $reservations
        ]);
    }
}
