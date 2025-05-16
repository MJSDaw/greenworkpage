<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;


class AuthController extends Controller
{
    /**
     * Registrar un nuevo usuario
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\"\-]+$/', // Letras, espacios, comillas y guiones
            ],
            'surname' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\"\-]+$/', // Letras, espacios, comillas y guiones
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
                'regex:/^(([0-9]{8}[A-Za-z])|([XYZ][0-9]{7}[A-Za-z])|([XYZ][0-9]{7}))$/' // Formatos: 12345678A, X12345678L, X12345678
            ],
            'birthdate' => 'required|date|date_format:Y-m-d|before_or_equal:' . now()->subYears(13)->format('Y-m-d'),
            'password' => [
                'required',
                'string',
                'min:8',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/',
            ],
            'passwordConfirm' => 'required|same:password',
            'termsAndConditions' => 'required|boolean|accepted',
        ]);

        if ($validator->fails()) {
            $errors = [];
            $validationErrors = $validator->errors()->toArray();
            
            // Procesar errores de nombre con más detalle
            if (isset($validationErrors['name'])) {
                $name = $request->input('name');
                $nameErrors = [];
                
                // Solo procesar si el campo no está vacío
                if (!empty($name)) {
                    // Comprobar si contiene números
                    if (preg_match('/[0-9]/', $name)) {
                        $nameErrors[] = 'nameContainsNumbersError';
                    }
                    
                    // Comprobar si contiene caracteres especiales no permitidos
                    // Permitidos: letras, espacios, guiones y comillas
                    if (preg_match('/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s\"\-]/', $name)) {
                        $nameErrors[] = 'nameContainsSpecialCharsError';
                    }
                }
                
                // Si hay errores específicos, los agregamos
                if (!empty($nameErrors)) {
                    $errors['name'] = $nameErrors;
                } else {
                    // Si no hay errores específicos pero falla la validación, usamos mensaje genérico
                    foreach ($validationErrors['name'] as $errorMessage) {
                        $errors['name'][] = $this->mapErrorToKey('name', $errorMessage);
                    }
                }
                
                // Removemos el name del array de errores generales para evitar duplicación
                unset($validationErrors['name']);
            }
            
            // Procesar errores de apellido con más detalle
            if (isset($validationErrors['surname'])) {
                $surname = $request->input('surname');
                $surnameErrors = [];
                
                // Solo procesar si el campo no está vacío
                if (!empty($surname)) {
                    // Comprobar si contiene números
                    if (preg_match('/[0-9]/', $surname)) {
                        $surnameErrors[] = 'surnameContainsNumbersError';
                    }
                    
                    // Comprobar si contiene caracteres especiales no permitidos
                    // Permitidos: letras, espacios, guiones y comillas
                    if (preg_match('/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s\"\-]/', $surname)) {
                        $surnameErrors[] = 'surnameContainsSpecialCharsError';
                    }
                }
                
                // Si hay errores específicos, los agregamos
                if (!empty($surnameErrors)) {
                    $errors['surname'] = $surnameErrors;
                } else {
                    // Si no hay errores específicos pero falla la validación, usamos mensaje genérico
                    foreach ($validationErrors['surname'] as $errorMessage) {
                        $errors['surname'][] = $this->mapErrorToKey('surname', $errorMessage);
                    }
                }
                
                // Removemos el surname del array de errores generales para evitar duplicación
                unset($validationErrors['surname']);
            }
            
            // Procesar errores de DNI con más detalle
            if (isset($validationErrors['dni'])) {
                $dni = $request->input('dni');
                $dniErrors = [];
                
                // Solo procesar si el campo no está vacío
                if (!empty($dni)) {
                    // Comprobar longitud mínima (debe tener al menos 9 caracteres para formato nacional o 10 para extranjeros)
                    if (strlen($dni) < 9) {
                        $dniErrors[] = 'nifTooShortError';
                    }
                    
                    // Comprobar formato para DNI nacional (8 números + 1 letra)
                    if (!preg_match('/^[0-9]{8}[A-Za-z]$/', $dni)) {
                        // Comprobar formato para NIE (X/Y/Z + 7 números + 1 letra)
                        if (!preg_match('/^[XYZ][0-9]{7}[A-Za-z]$/', $dni) && !preg_match('/^[XYZ][0-9]{7}$/', $dni)) {
                            $dniErrors[] = 'nifFormatError';
                        }
                    }
                }
                
                // Si hay errores específicos, los agregamos
                if (!empty($dniErrors)) {
                    $errors['dni'] = $dniErrors;
                } else {
                    // Si no hay errores específicos pero falla la validación, usamos mensaje genérico
                    foreach ($validationErrors['dni'] as $errorMessage) {
                        $errors['dni'][] = $this->mapErrorToKey('dni', $errorMessage);
                    }
                }
                
                // Removemos el dni del array de errores generales para evitar duplicación
                unset($validationErrors['dni']);
            }
            
            // Procesar errores de contraseña con más detalle
            if (isset($validationErrors['password'])) {
                $password = $request->input('password');
                $passwordErrors = [];
                
                // Comprobar longitud mínima (8 caracteres)
                if ($password && strlen($password) < 8) {
                    $passwordErrors[] = 'passwordMinNumCharsError';
                }
                
                // Comprobar si está vacío
                if (empty($password)) {
                    $passwordErrors[] = 'passwordRequiredError';
                } else {
                    // Comprobar mayúscula
                    if (!preg_match('/[A-Z]/', $password)) {
                        $passwordErrors[] = 'passwordMissingUppercaseCharError';
                    }
                    
                    // Comprobar minúscula
                    if (!preg_match('/[a-z]/', $password)) {
                        $passwordErrors[] = 'passwordMissingLowercaseCharError';
                    }
                    
                    // Comprobar números
                    if (!preg_match('/[0-9]/', $password)) {
                        $passwordErrors[] = 'passwordMissingNumberError';
                    }
                    
                    // Comprobar caracteres especiales
                    if (!preg_match('/[@$!%*?&]/', $password)) {
                        $passwordErrors[] = 'passwordMissingSpecialCharError';
                    }
                }
                
                // Si hay errores específicos, los agregamos
                if (!empty($passwordErrors)) {
                    $errors['password'] = $passwordErrors;
                } else {
                    // Si no hay errores específicos pero falla la validación, usamos mensaje genérico
                    foreach ($validationErrors['password'] as $errorMessage) {
                        $errors['password'][] = $this->mapErrorToKey('password', $errorMessage);
                    }
                }
                
                // Removemos la contraseña del array de errores generales para evitar duplicación
                unset($validationErrors['password']);
            }
            
            // Procesar el resto de errores
            foreach ($validationErrors as $field => $errorMessages) {
                foreach ($errorMessages as $errorMessage) {
                    // Convertir el tipo de error a una clave específica
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
            'token' => $token
        ], 201);
    }

    /**
     * Iniciar sesión de usuario
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

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => ['auth' => ['invalidCredentialsError']]
            ], 401);
        }

        // Revocar tokens anteriores
        $user->tokens()->delete();

        // Crear nuevo token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token
        ]);
    }

    /**
     * Iniciar sesión de administrador
     */
    public function adminLogin(Request $request)
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

        $admin = \App\Models\Admin::where('email', $request->email)->first();

        if (!$admin || !Hash::check($request->password, $admin->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => ['auth' => ['invalidAdminCredentialsError']]
            ], 401);
        }

        // Revocar tokens anteriores
        $admin->tokens()->delete();

        // Crear nuevo token con guard de admin
        $token = $admin->createToken('admin_token', ['admin'])->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Admin login successful',
            'user' => $admin,
            'token' => $token
        ]);
    }

    /**
     * Cerrar sesión
     */
    public function logout(Request $request)
    {
        // Revocar el token actual
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Mapear mensajes de error a claves específicas
     */
    private function mapErrorToKey($field, $message)
    {
        // Mapeo de errores comunes a claves específicas
        $errorMappings = [
            // Campo name
            'name' => [
                'required' => 'nameRequiredError',
                'string' => 'nameTypeError',
                'max' => 'nameLengthError',
                'regex' => 'nameFormatError',
                'has_numbers' => 'nameContainsNumbersError',
                'has_special_chars' => 'nameContainsSpecialCharsError',
            ],
            // Campo surname
            'surname' => [
                'required' => 'surnameRequiredError',
                'string' => 'surnameTypeError',
                'max' => 'surnameLengthError',
                'regex' => 'surnameFormatError',
                'has_numbers' => 'surnameContainsNumbersError',
                'has_special_chars' => 'surnameContainsSpecialCharsError',
            ],
            // Campo email
            'email' => [
                'required' => 'emailRequiredError',
                'string' => 'emailTypeError',
                'email' => 'emailFormatError',
                'max' => 'emailLengthError',
                'unique' => 'emailDuplicateError',
            ],
            // Campo DNI
            'dni' => [
                'required' => 'nifRequiredError',
                'string' => 'nifTypeError',
                'max' => 'nifLengthError',
                'regex' => 'nifFormatError',
                'unique' => 'nifDuplicateError',
            ],
            // Campo birthdate
            'birthdate' => [
                'required' => 'birthdateRequiredError',
                'date' => 'birthdateInvalidError',
                'date_format' => 'birthdateFormatError',
                'before_or_equal' => 'birthdateAgeError',
            ],
            // Campo termsAndConditions
            'termsAndConditions' => [
                'required' => 'termsRequiredError',
                'boolean' => 'termsTypeError',
                'accepted' => 'termsNotAcceptedError',
            ],
        ];
        
        // Procesamiento especial para contraseña
        if ($field === 'password') {
            // Verificar diferentes tipos de errores específicos para la contraseña
            if (strpos($message, 'required') !== false) {
                return 'passwordRequiredError';
            }
            if (strpos($message, 'string') !== false) {
                return 'passwordTypeError';
            }
            if (strpos($message, 'min') !== false) {
                return 'passwordMinNumCharsError';
            }
            
            // Para errores de regex de contraseña, proporcionar errores específicos
            if (strpos($message, 'regex') !== false) {
                $password = request()->input('password');
                $errors = [];
                
                // Si no hay contraseña, no continuamos con la validación
                if (!$password) {
                    return 'passwordRequiredError';
                }
                
                // Comprobar longitud mínima (8 caracteres)
                if (strlen($password) < 8) {
                    return 'passwordMinNumCharsError';
                }
                
                // Comprobar mayúscula
                if (!preg_match('/[A-Z]/', $password)) {
                    return 'passwordMissingUppercaseCharError';
                }
                
                // Comprobar minúscula
                if (!preg_match('/[a-z]/', $password)) {
                    return 'passwordMissingLowercaseCharError';
                }
                
                // Comprobar números
                if (!preg_match('/[0-9]/', $password)) {
                    return 'passwordMissingNumberError';
                }
                
                // Comprobar caracteres especiales
                if (!preg_match('/[@$!%*?&]/', $password)) {
                    return 'passwordMissingSpecialCharError';
                }
                
                // Si llegamos aquí, hay otro problema con la regex
                return 'passwordComplexityError';
            }
            
            // Cualquier otro error de contraseña
            return 'passwordError';
        }
        
        // Procesamiento especial para campo passwordConfirm
        if ($field === 'passwordConfirm') {
            if (strpos($message, 'required') !== false) {
                return 'passwordConfirmRequiredError';
            }
            if (strpos($message, 'same') !== false) {
                return 'passwordMismatchError';
            }
            return 'passwordConfirmError';
        }

        // Para otros campos, usar el mapeo estándar
        if (isset($errorMappings[$field])) {
            foreach ($errorMappings[$field] as $errorType => $errorKey) {
                if (strpos($message, $errorType) !== false) {
                    return $errorKey;
                }
            }
        }

        // Si no se encuentra un mapeo específico, devolver una clave genérica
        return $field . 'Error';
    }
}
