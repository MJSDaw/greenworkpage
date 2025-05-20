<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Reservation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Get a random user
        $user = User::inRandomOrder()->first() ?? User::factory()->create();
        
        // Try to get a reservation for this user
        $reservation = Reservation::where('user_id', $user->id)
                                  ->inRandomOrder()
                                  ->first();
        
        // If no reservation found, set reservation fields to null
        $userData = [
            'user_id' => $user->id,
            'user_reservation_id' => null,
            'space_reservation_id' => null,
            'reservation_period' => null,
        ];
        
        // If a reservation was found, use its data
        if ($reservation) {
            $userData = [
                'user_id' => $user->id,
                'user_reservation_id' => $reservation->user_id,
                'space_reservation_id' => $reservation->space_id,
                'reservation_period' => $reservation->reservation_period,
            ];
        }        return array_merge($userData, [
            'amount' => $this->faker->randomFloat(2, 10, 1000),
            'status' => $this->faker->randomElement(['pending', 'completed', 'failed', 'refunded']),
            'payment_method' => $this->faker->randomElement(['credit_card', 'transfer', 'paypal', 'cash']),
            'payment_date' => $this->faker->dateTimeBetween('-1 year', 'now'),
        ]);
    }

    /**
     * Set the payment status to pending.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function pending()
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }

    /**
     * Set the payment status to completed.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function completed()
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
        ]);
    }
}
