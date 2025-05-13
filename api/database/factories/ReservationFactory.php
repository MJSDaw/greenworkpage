<?php

namespace Database\Factories;

use App\Models\Space;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Reservation>
 */
class ReservationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {        return [
            'user_id' => User::factory(),
            'space_id' => Space::factory(),
            'reservation_period' => function() {
                $start = $this->faker->dateTimeBetween('now', '+1 month')->format('Y-m-d H:i');
                $end = $this->faker->dateTimeBetween($start, '+5 days')->format('Y-m-d H:i');
                return $start . '|' . $end;
            },
        ];
    }
}
