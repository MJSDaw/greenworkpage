<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Admin>
 */
class AdminFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Genera un correo único y verifica que no exista en la tabla users
        $email = $this->generateUniqueEmail();

        return [
            'name' => fake()->name(),
            'email' => $email,
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Genera un correo electrónico que no esté en uso por ningún usuario.
     */
    protected function generateUniqueEmail(): string
    {
        $maxAttempts = 10;
        $attempts = 0;
        
        do {
            $email = fake()->unique()->safeEmail();
            $exists = User::where('email', $email)->exists();
            $attempts++;
        } while ($exists && $attempts < $maxAttempts);
        
        // Si después de varios intentos no se encontró un correo único, generamos uno con un prefijo especial
        if ($exists) {
            $email = 'admin_' . $email;
        }
        
        return $email;
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
