<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Space>
 */
class SpaceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'places' => fake()->numberBetween(1, 50),
            'price' => fake()->randomFloat(2, 10, 500),
            'schedule' => fake()->time('H:i') . ' - ' . fake()->time('H:i'),
            'images' => 'image' . fake()->numberBetween(1, 5) . '.jpg',
            'description' => fake()->paragraph(),
            'subtitle' => fake()->sentence(),
        ];
    }
}
