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

        $contact = Contact::create([
            'name' => $request->name,
            'email' => $request->email,
            'termsAndConditions' => $request->termsAndConditions,
        ]);

        // Envía el correo de notificación
        try {
            // Intenta crear un archivo de log para debug
            $logPath = storage_path('logs/mail_debug.log');
            file_put_contents($logPath, date('Y-m-d H:i:s') . " - Intentando enviar correo a: info.greenworksagaseta@gmail.com\n", FILE_APPEND);
            file_put_contents($logPath, date('Y-m-d H:i:s') . " - Datos: " . json_encode($request->all()) . "\n", FILE_APPEND);
            
            // Enviamos el correo usando directamente el método sendWithPythonMailer
            $mail = new ContactNotification($contact, $request->message);
            $result = $mail->sendWithPythonMailer();
            
            // Registramos el resultado
            file_put_contents($logPath, date('Y-m-d H:i:s') . " - Correo enviado con Python: " . json_encode($result) . "\n", FILE_APPEND);
        } catch (\Exception $e) {
            // Registra el error pero permite que la API siga funcionando
            $errorMessage = 'Error al enviar el correo: ' . $e->getMessage() . "\n" . $e->getTraceAsString();
            file_put_contents(storage_path('logs/mail_error.log'), date('Y-m-d H:i:s') . " - $errorMessage\n", FILE_APPEND);
        }

        return response()->json([
            'message' => 'Contact created successfully',
            'contact' => $contact
        ], 201);
    }
}
