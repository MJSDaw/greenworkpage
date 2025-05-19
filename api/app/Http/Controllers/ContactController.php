<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Mail\ContactNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    /**
     * Display a listing of all contacts with filtering and ordering capabilities.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $query = Contact::query();
        
        // Filtering by name
        if ($request->has('name')) {
            $query->filterByName($request->name);
        }
        
        // Filtering by email
        if ($request->has('email')) {
            $query->filterByEmail($request->email);
        }
        
        // Filtering by terms and conditions acceptance
        if ($request->has('termsAndConditions')) {
            $termsValue = filter_var($request->termsAndConditions, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($termsValue !== null) {
                $query->where('termsAndConditions', $termsValue);
            }
        }
        
        // Filtering by created date range
        if ($request->has('created_from') && $request->has('created_to')) {
            $query->createdBetween($request->created_from, $request->created_to);
        } else if ($request->has('created_from')) {
            $query->where('created_at', '>=', $request->created_from);
        } else if ($request->has('created_to')) {
            $query->where('created_at', '<=', $request->created_to);
        }
        
        // Search by any field
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', '%' . $searchTerm . '%')
                  ->orWhere('email', 'like', '%' . $searchTerm . '%');
            });
        }
        
        // Ordering
        $orderBy = $request->input('order_by', 'created_at');
        $direction = $request->input('direction', 'desc');
        
        // Validate order_by field to prevent SQL injection
        $allowedOrderFields = ['id', 'name', 'email', 'termsAndConditions', 'created_at', 'updated_at'];
        if (in_array($orderBy, $allowedOrderFields)) {
            $query->orderBy($orderBy, $direction === 'asc' ? 'asc' : 'desc');
        } else {
            $query->orderBy('created_at', 'desc'); // Default ordering
        }
        
        // Pagination
        $perPage = (int) $request->input('per_page', 10);
        $perPage = max(1, min(100, $perPage)); // Limit between 1 and 100
        
        $contacts = $query->paginate($perPage);
        
        return response()->json([
            'data' => $contacts->items(),
            'meta' => [
                'current_page' => $contacts->currentPage(),
                'last_page' => $contacts->lastPage(),
                'per_page' => $contacts->perPage(),
                'total' => $contacts->total()
            ]
        ]);
    }

    /**
     * Store a newly created contact in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'termsAndConditions' => 'required|boolean|accepted',
            'message' => 'nullable|string',
        ]);        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Additional check to ensure termsAndConditions is true
        if ($request->termsAndConditions !== true) {
            return response()->json([
                'errors' => ['termsAndConditions' => ['You must accept the terms and conditions.']]
            ], 422);
        }

        // Check if there's a contact with the same email in the last 24 hours
        $recentContact = Contact::where('email', $request->email)
            ->where('created_at', '>=', now()->subHours(24))
            ->first();

        if ($recentContact) {
            return response()->json([
                'errors' => ['email' => ['wait24Hours']]
            ], 422);
        }

        $contact = Contact::create([
            'name' => $request->name,
            'email' => $request->email,
            'termsAndConditions' => $request->termsAndConditions,
        ]);

        // Send mail
        try {
            // Create a debug file
            $logPath = storage_path('logs/mail_debug.log');
            file_put_contents($logPath, date('Y-m-d H:i:s') . " - Intentando enviar correo a: info.greenworksagaseta@gmail.com\n", FILE_APPEND);
            file_put_contents($logPath, date('Y-m-d H:i:s') . " - Datos: " . json_encode($request->all()) . "\n", FILE_APPEND);
            
            // send mail using sendWithPythonMailer
            $mail = new ContactNotification($contact, $request->message);
            $result = $mail->sendWithPythonMailer();
            
            // Save the result
            file_put_contents($logPath, date('Y-m-d H:i:s') . " - Correo enviado con Python: " . json_encode($result) . "\n", FILE_APPEND);
        } catch (\Exception $e) {
            // Save the error message
            $errorMessage = 'Error al enviar el correo: ' . $e->getMessage() . "\n" . $e->getTraceAsString();
            file_put_contents(storage_path('logs/mail_error.log'), date('Y-m-d H:i:s') . " - $errorMessage\n", FILE_APPEND);
        }

        return response()->json([
            'message' => 'Contact created successfully',
            'contact' => $contact
        ], 201);
    }
}
