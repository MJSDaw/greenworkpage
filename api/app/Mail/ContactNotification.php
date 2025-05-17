<?php

namespace App\Mail;

use App\Models\Contact;
use App\Services\PythonMailer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\View;

class ContactNotification extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * The contact instance.
     *
     * @var \App\Models\Contact
     */
    public $contact;
    public $message;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(Contact $contact, $message = null)
    {
        $this->contact = $contact;
        $this->message = $message;
    }    /**
     * Send email directly with Python mailer.
     */
    public function sendWithPythonMailer()
    {
        try {
            // Generate email content from the view
            $htmlContent = View::make('emails.contact', [
                'contact' => $this->contact,
                'message' => $this->message
            ])->render();
            
            // Use the Python mailer service
            $pythonMailer = new PythonMailer();
            $result = $pythonMailer->sendMail(
                'info.greenworksagaseta@gmail.com',
                'Nuevo contacto de la web',
                $htmlContent
            );
            
            Log::info('PythonMailer result:', $result);
            
            return $result;
        } catch (\Exception $e) {
            Log::error('Error sending email with PythonMailer: ' . $e->getMessage());
            throw $e;
        }
    }
}
