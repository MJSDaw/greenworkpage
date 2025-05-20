<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\User;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    /**
     * Get all pending payments.
     *
     * @return \Illuminate\Http\Response
     */
    public function getPendingPayments()
    {
        try {
            $pendingPayments = Payment::where('status', '!=', 'completed')
                ->with(['user:id,name,email', 'reservation'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $pendingPayments
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving pending payments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all completed payments.
     *
     * @return \Illuminate\Http\Response
     */
    public function getCompletedPayments()
    {
        try {
            $completedPayments = Payment::where('status', 'completed')
                ->with(['user:id,name,email', 'reservation'])
                ->orderBy('payment_date', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $completedPayments
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving completed payments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new payment.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
                'user_reservation_id' => 'required',
                'space_reservation_id' => 'required',
                'reservation_period' => 'required',
                'amount' => 'required|numeric|min:0',
                'payment_method' => 'required|string',
                'status' => 'required|in:pending,completed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if reservation exists
            $reservation = Reservation::where('user_id', $request->user_reservation_id)
                ->where('space_id', $request->space_reservation_id)
                ->where('reservation_period', $request->reservation_period)
                ->first();

            if (!$reservation) {
                return response()->json([
                    'success' => false,
                    'message' => 'The specified reservation does not exist'
                ], 404);
            }

            $payment = Payment::create([
                'user_id' => $request->user_id,
                'user_reservation_id' => $request->user_reservation_id,
                'space_reservation_id' => $request->space_reservation_id,
                'reservation_period' => $request->reservation_period,
                'amount' => $request->amount,
                'status' => $request->status,
                'payment_method' => $request->payment_method,
                'payment_date' => $request->status === 'completed' ? now() : null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment created successfully',
                'data' => $payment
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an existing payment.
     * Only non-completed payments can be updated.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        try {
            $payment = Payment::findOrFail($id);

            // Check if payment is already completed
            if ($payment->status === 'completed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot update a completed payment'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'amount' => 'sometimes|numeric|min:0',
                'payment_method' => 'sometimes|string',
                'status' => 'sometimes|in:pending,completed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Update payment fields
            if ($request->has('amount')) {
                $payment->amount = $request->amount;
            }

            if ($request->has('payment_method')) {
                $payment->payment_method = $request->payment_method;
            }

            if ($request->has('status')) {
                $payment->status = $request->status;
                
                // If status is being set to completed, update the payment date
                if ($request->status === 'completed') {
                    $payment->payment_date = now();
                }
            }

            $payment->save();

            return response()->json([
                'success' => true,
                'message' => 'Payment updated successfully',
                'data' => $payment
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
