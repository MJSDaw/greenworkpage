<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    /**
     * Display a listing of all contacts.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $contacts = Contact::all();
        return response()->json($contacts);
    }

    /**
     * Store a newly created contact in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:contacts',
            'termsAndConditions' => 'required|boolean|accepted',
        ]);        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Additional check to ensure termsAndConditions is true
        if ($request->termsAndConditions !== true) {
            return response()->json([
                'errors' => ['termsAndConditions' => ['You must accept the terms and conditions.']]
            ], 422);
        }

        $contact = Contact::create([
            'email' => $request->email,
            'termsAndConditions' => $request->termsAndConditions,
        ]);

        return response()->json([
            'message' => 'Contact created successfully',
            'contact' => $contact
        ], 201);
    }
}
