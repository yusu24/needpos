<?php
// database/seeders/CategorySeeder.php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Outlet;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $outlet = Outlet::where('name', 'Demo Outlet')->first();

        $categories = [
            ['name' => 'Makanan',   'color' => '#f59e0b', 'icon' => '🍔', 'sort_order' => 1],
            ['name' => 'Minuman',   'color' => '#3b82f6', 'icon' => '🥤', 'sort_order' => 2],
            ['name' => 'Snack',     'color' => '#10b981', 'icon' => '🍿', 'sort_order' => 3],
            ['name' => 'Dessert',   'color' => '#ec4899', 'icon' => '🍰', 'sort_order' => 4],
            ['name' => 'Lainnya',   'color' => '#6366f1', 'icon' => '📦', 'sort_order' => 5],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['outlet_id' => $outlet->id, 'name' => $category['name']],
                array_merge($category, ['outlet_id' => $outlet->id, 'is_active' => true])
            );
        }
    }
}
