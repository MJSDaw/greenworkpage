<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class PythonMailer
{
    /**
     * Send an email using the Python Gmail script
     *
     * @param string $receiverEmail
     * @param string $subject
     * @param string $body
     * @return array
     */
    public function sendMail(string $receiverEmail, string $subject, string $body): array
    {        // Get sender email and app password from environment
        $senderEmail = "info.greenworksagaseta@gmail.com";
        $appPassword = "tjor lzrm bzhm hiud";

        // Eliminar comillas si están presentes
        if (strpos($appPassword, '"') === 0 && strrpos($appPassword, '"') === strlen($appPassword) - 1) {
            $appPassword = substr($appPassword, 1, -1);
        }

        Log::info('PythonMailer: SenderEmail = ' . $senderEmail);
        Log::info('PythonMailer: AppPassword length = ' . strlen($appPassword));

        if (empty($senderEmail) || empty($appPassword)) {
            Log::error('PythonMailer: Missing sender email or app password in .env');
            return [
                'status' => 'error',
                'message' => 'Missing sender email or app password configuration'
            ];
        }

        // Prepare data as JSON for the Python script
        $data = [
            'sender_email' => $senderEmail,
            'app_password' => $appPassword,
            'receiver_email' => $receiverEmail,
            'subject' => $subject,
            'body' => $body
        ];

        $jsonData = json_encode($data);

        // Path to the Python script
        $scriptPath = base_path('scripts/gmail_sender.py');

        if (!file_exists($scriptPath)) {
            Log::error('PythonMailer: Script not found at ' . $scriptPath);
            return [
                'status' => 'error',
                'message' => 'Python script not found'
            ];
        }        // Execute the Python script
        $command = "python3 \"$scriptPath\" " . escapeshellarg($jsonData) . " 2>&1";
        
        Log::info('PythonMailer: Executing command ' . $command);
        
        $output = null;
        $returnVar = null;
        
        exec($command, $output, $returnVar);
        
        // Process the result
        $result = implode("\n", $output);
        
        Log::info('PythonMailer: Script return code: ' . $returnVar);
        Log::info('PythonMailer: Script output: ' . $result);
        
        // Try to decode the JSON response
        try {
            $jsonResult = json_decode($result, true);
            
            if (json_last_error() === JSON_ERROR_NONE) {
                return $jsonResult;
            }
            
            return [
                'status' => 'error',
                'message' => 'Invalid JSON response from Python script: ' . $result,
                'raw_output' => $output
            ];
        } catch (\Exception $e) {
            Log::error('PythonMailer: Error parsing script output: ' . $e->getMessage());
            
            return [
                'status' => 'error',
                'message' => 'Error parsing script output: ' . $e->getMessage(),
                'raw_output' => $output
            ];
        }
    }
}
