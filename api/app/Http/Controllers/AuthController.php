<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;


class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\"\-]+$/', // Characters allowed: letters, spaces, hyphens, and quotes
            ],
            'surname' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\"\-]+$/', // Characters allowed: letters, spaces, hyphens, and quotes
            ],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users',
                'unique:admins',
            ],
            'dni' => [
                'required',
                'string',
                'max:20',
                'unique:users',
                'regex:/^(([0-9]{8}[A-Za-z])|([XYZ][0-9]{7}[A-Za-z])|([XYZ][0-9]{7}))$/' // Valid formats: 12345678A, X12345678L, X12345678
            ],
            'birthdate' => 'required|date|date_format:Y-m-d|before_or_equal:' . now()->subYears(13)->format('Y-m-d'),
            'password' => [
                'required',
                'string',
                'min:8',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]/',
            ],
            'passwordConfirm' => 'required|same:password',
            'termsAndConditions' => 'required|boolean|accepted',
        ]);

        if ($validator->fails()) {
            $errors = [];
            $validationErrors = $validator->errors()->toArray();
            
            // Validation errors for name and surname
            if (isset($validationErrors['name'])) {
                $name = $request->input('name');
                $nameErrors = [];
                
                if (!empty($name)) {
                    if (preg_match('/[0-9]/', $name)) {
                        $nameErrors[] = 'nameContainsNumbersError';
                    }
                    // Characters allowed: letters, spaces, hyphens, and quotes
                    if (preg_match('/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s\"\-]/', $name)) {
                        $nameErrors[] = 'nameContainsSpecialCharsError';
                    }
                }
                
                // If there are specific errors, we add them
                if (!empty($nameErrors)) {
                    $errors['name'] = $nameErrors;
                } else {
                    // If there are no specific errors but validation fails, we use the generic message
                    foreach ($validationErrors['name'] as $errorMessage) {
                        $errors['name'][] = $this->mapErrorToKey('name', $errorMessage);
                    }
                }
                
                // Remove the name from the general errors array to avoid duplication
                unset($validationErrors['name']);
            }
            
            // Validation errors for surname
            if (isset($validationErrors['surname'])) {
                $surname = $request->input('surname');
                $surnameErrors = [];
                
                if (!empty($surname)) {
                    if (preg_match('/[0-9]/', $surname)) {
                        $surnameErrors[] = 'surnameContainsNumbersError';
                    }
                    
                    // Valid characters: letters, spaces, hyphens, and quotes
                    if (preg_match('/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s\"\-]/', $surname)) {
                        $surnameErrors[] = 'surnameContainsSpecialCharsError';
                    }
                }
                
                // IF there are specific errors, we add them
                if (!empty($surnameErrors)) {
                    $errors['surname'] = $surnameErrors;
                } else {
                    // If there are no specific errors but validation fails, we use the generic message
                    foreach ($validationErrors['surname'] as $errorMessage) {
                        $errors['surname'][] = $this->mapErrorToKey('surname', $errorMessage);
                    }
                }
                
                // Remove the surname from the general errors array to avoid duplication
                unset($validationErrors['surname']);
            }
            
            // Process email errors
            if (isset($validationErrors['dni'])) {
                $dni = $request->input('dni');
                $dniErrors = [];
                
                if (!empty($dni)) {
                    if (strlen($dni) < 9) {
                        $dniErrors[] = 'nifTooShortError';
                    }
                    
                    // Format: 8 digits + 1 letter
                    if (!preg_match('/^[0-9]{8}[A-Za-z]$/', $dni)) {
                        // Format: X, Y, Z + 7 digits + 1 letter
                        if (!preg_match('/^[XYZ][0-9]{7}[A-Za-z]$/', $dni) && !preg_match('/^[XYZ][0-9]{7}$/', $dni)) {
                            $dniErrors[] = 'nifFormatError';
                        }
                    }
                }
                
                // If there are specific errors, we add them
                if (!empty($dniErrors)) {
                    $errors['dni'] = $dniErrors;
                } else {
                    // If there are no specific errors but validation fails, we use the generic message
                    foreach ($validationErrors['dni'] as $errorMessage) {
                        $errors['dni'][] = $this->mapErrorToKey('dni', $errorMessage);
                    }
                }
                
                // Remove the dni from the general errors array to avoid duplication
                unset($validationErrors['dni']);
            }
            
            // Process password errors in more detail
            if (isset($validationErrors['password'])) {
                $password = $request->input('password');
                $passwordErrors = [];
                
                // Check minimum length (8 characters)
                if ($password && strlen($password) < 8) {
                    $passwordErrors[] = 'passwordMinNumCharsError';
                }
                
                // Check if it's empty
                if (empty($password)) {
                    $passwordErrors[] = 'passwordRequiredError';
                } else {
                    // Check uppercase
                    if (!preg_match('/[A-Z]/', $password)) {
                        $passwordErrors[] = 'passwordMissingUppercaseCharError';
                    }
                    
                    // Check lowercase
                    if (!preg_match('/[a-z]/', $password)) {
                        $passwordErrors[] = 'passwordMissingLowercaseCharError';
                    }
                    
                    // Check numbers
                    if (!preg_match('/[0-9]/', $password)) {
                        $passwordErrors[] = 'passwordMissingNumberError';
                    }
                    
                    // Check special characters
                    if (!preg_match('/[@$!%*?&.]/', $password)) {
                        $passwordErrors[] = 'passwordMissingSpecialCharError';
                    }
                }
                
                // If there are specific errors, we add them
                if (!empty($passwordErrors)) {
                    $errors['password'] = $passwordErrors;
                } else {
                    // If there are no specific errors but validation fails, we use generic message
                    foreach ($validationErrors['password'] as $errorMessage) {
                        $errors['password'][] = $this->mapErrorToKey('password', $errorMessage);
                    }
                }
                
                // Remove the password from the general errors array to avoid duplication
                unset($validationErrors['password']);
            }
            
            // Process the rest of the errors
            foreach ($validationErrors as $field => $errorMessages) {
                foreach ($errorMessages as $errorMessage) {
                    // Convert the error type to a specific key
                    $errorKey = $this->mapErrorToKey($field, $errorMessage);
                    if (!isset($errors[$field])) {
                        $errors[$field] = [];
                    }
                    $errors[$field][] = $errorKey;
                }
            }

            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $errors
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'surname' => $request->surname,
            'email' => $request->email,
            'dni' => $request->dni,
            'birthdate' => $request->birthdate,
            'password' => Hash::make($request->password),
            'termsAndConditions' => $request->termsAndConditions,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'User registered successfully',
            'user' => $user,
            'token' => $token,
            'userType' => 'user'
        ], 201);
    }

    /**
     * User login
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            $errors = [];
            foreach ($validator->errors()->toArray() as $field => $errorMessages) {
                foreach ($errorMessages as $errorMessage) {
                    $errorKey = $this->mapErrorToKey($field, $errorMessage);
                    if (!isset($errors[$field])) {
                        $errors[$field] = [];
                    }
                    $errors[$field][] = $errorKey;
                }
            }

            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $errors
            ], 422);
        }

        // Check in User table
        $user = User::where('email', $request->email)->first();
        
        // Check in Admin table if not found in User table
        $admin = null;
        if (!$user) {
            $admin = \App\Models\Admin::where('email', $request->email)->first();
        }

        // If not found in either table
        if (!$user && !$admin) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => ['email' => ['emailNotExistsError']]
            ], 401);
        }

        // Check if credentials are valid for a user
        if ($user) {
            if (!Hash::check($request->password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => ['auth' => ['invalidCredentialsError']]
                ], 401);
            }

            // Revoke previous tokens
            $user->tokens()->delete();

            // Create new token
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'user' => $user,
                'token' => $token,
                'userType' => 'user'
            ]);
        }
        
        // Check if credentials are valid for an admin
        if (!Hash::check($request->password, $admin->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => ['auth' => ['invalidCredentialsError']]
            ], 401);
        }

        // Revoke previous tokens
        $admin->tokens()->delete();

        // Create new token with admin permissions
        $token = $admin->createToken('admin_token', ['admin'])->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user' => $admin,
            'token' => $token,
            'userType' => 'admin'
        ]);
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        // Revoke the current token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Map error messages to specific keys
     */
    private function mapErrorToKey($field, $message)
    {
        // Mapping of common errors to specific keys
        $errorMappings = [
            // Name field
            'name' => [
                'required' => 'nameRequiredError',
                'string' => 'nameTypeError',
                'max' => 'nameLengthError',
                'regex' => 'nameFormatError',
                'has_numbers' => 'nameContainsNumbersError',
                'has_special_chars' => 'nameContainsSpecialCharsError',
            ],
            // Surname field
            'surname' => [
                'required' => 'surnameRequiredError',
                'string' => 'surnameTypeError',
                'max' => 'surnameLengthError',
                'regex' => 'surnameFormatError',
                'has_numbers' => 'surnameContainsNumbersError',
                'has_special_chars' => 'surnameContainsSpecialCharsError',
            ],
            // Email field
            'email' => [
                'required' => 'emailRequiredError',
                'string' => 'emailTypeError',
                'email' => 'emailFormatError',
                'max' => 'emailLengthError',
                'unique' => 'emailDuplicateError',
            ],
            // DNI field
            'dni' => [
                'required' => 'nifRequiredError',
                'string' => 'nifTypeError',
                'max' => 'nifLengthError',
                'regex' => 'nifFormatError',
                'unique' => 'nifDuplicateError',
            ],
            // Birthdate field
            'birthdate' => [
                'required' => 'birthdateRequiredError',
                'date' => 'birthdateInvalidError',
                'date_format' => 'birthdateFormatError',
                'before_or_equal' => 'birthdateAgeError',
            ],
            // Terms and conditions field
            'termsAndConditions' => [
                'required' => 'termsRequiredError',
                'boolean' => 'termsTypeError',
                'accepted' => 'termsNotAcceptedError',
            ],
        ];
        
        // Special processing for password
        if ($field === 'password') {
            // Check different types of specific errors for the password
            if (strpos($message, 'required') !== false) {
                return 'passwordRequiredError';
            }
            if (strpos($message, 'string') !== false) {
                return 'passwordTypeError';
            }
            if (strpos($message, 'min') !== false) {
                return 'passwordMinNumCharsError';
            }
            
            // For password regex errors, provide specific errors
            if (strpos($message, 'regex') !== false) {
                $password = request()->input('password');
                $errors = [];
                
                // If there is no password, we don't continue with validation
                if (!$password) {
                    return 'passwordRequiredError';
                }
                
                // Check minimum length (8 characters)
                if (strlen($password) < 8) {
                    return 'passwordMinNumCharsError';
                }
                
                // Check uppercase
                if (!preg_match('/[A-Z]/', $password)) {
                    return 'passwordMissingUppercaseCharError';
                }
                
                // Check lowercase
                if (!preg_match('/[a-z]/', $password)) {
                    return 'passwordMissingLowercaseCharError';
                }
                
                // Check numbers
                if (!preg_match('/[0-9]/', $password)) {
                    return 'passwordMissingNumberError';
                }
                
                // Check special characters
                if (!preg_match('/[@$!%*?&.]/', $password)) {
                    return 'passwordMissingSpecialCharError';
                }
                
                // If we get here, there's another problem with the regex
                return 'passwordComplexityError';
            }
            
            // Any other password error
            return 'passwordError';
        }
        
        // Special processing for passwordConfirm field
        if ($field === 'passwordConfirm') {
            if (strpos($message, 'required') !== false) {
                return 'passwordConfirmRequiredError';
            }
            if (strpos($message, 'same') !== false) {
                return 'passwordMismatchError';
            }
            return 'passwordConfirmError';
        }

        // For other fields, use the standard mapping
        if (isset($errorMappings[$field])) {
            foreach ($errorMappings[$field] as $errorType => $errorKey) {
                if (strpos($message, $errorType) !== false) {
                    return $errorKey;
                }
            }
        }

        // If no specific mapping is found, return a generic key
        return $field . 'Error';
    }
}
