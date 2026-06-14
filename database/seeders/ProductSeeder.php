<?php
// database/seeders/ProductSeeder.php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Outlet;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $outlet = Outlet::where('name', 'Demo Outlet')->first();

        $categories = Category::where('outlet_id', $outlet->id)
            ->get()
            ->keyBy('name');

        $products = [
            // Makanan
            ['category' => 'Makanan', 'name' => 'Nasi Goreng Spesial', 'price' => 35000, 'cost_price' => 18000, 'sku' => 'MKN-001'],
            ['category' => 'Makanan', 'name' => 'Mie Goreng', 'price' => 28000, 'cost_price' => 13000, 'sku' => 'MKN-002'],
            ['category' => 'Makanan', 'name' => 'Ayam Bakar', 'price' => 45000, 'cost_price' => 25000, 'sku' => 'MKN-003'],
            ['category' => 'Makanan', 'name' => 'Soto Ayam', 'price' => 25000, 'cost_price' => 12000, 'sku' => 'MKN-004'],
            ['category' => 'Makanan', 'name' => 'Gado-Gado', 'price' => 22000, 'cost_price' => 10000, 'sku' => 'MKN-005'],

            // Minuman
            ['category' => 'Minuman', 'name' => 'Es Teh Manis', 'price' => 8000, 'cost_price' => 2000, 'sku' => 'MNM-001'],
            ['category' => 'Minuman', 'name' => 'Es Jeruk', 'price' => 10000, 'cost_price' => 3000, 'sku' => 'MNM-002'],
            ['category' => 'Minuman', 'name' => 'Jus Alpukat', 'price' => 18000, 'cost_price' => 7000, 'sku' => 'MNM-003'],
            ['category' => 'Minuman', 'name' => 'Kopi Hitam', 'price' => 12000, 'cost_price' => 4000, 'sku' => 'MNM-004'],
            ['category' => 'Minuman', 'name' => 'Air Mineral', 'price' => 5000, 'cost_price' => 2000, 'sku' => 'MNM-005'],

            // Snack
            ['category' => 'Snack', 'name' => 'Keripik Singkong', 'price' => 15000, 'cost_price' => 8000, 'sku' => 'SNK-001'],
            ['category' => 'Snack', 'name' => 'Pisang Goreng', 'price' => 12000, 'cost_price' => 5000, 'sku' => 'SNK-002'],
            ['category' => 'Snack', 'name' => 'Tahu Crispy', 'price' => 10000, 'cost_price' => 4000, 'sku' => 'SNK-003'],

            // Dessert
            ['category' => 'Dessert', 'name' => 'Es Krim Vanilla', 'price' => 20000, 'cost_price' => 8000, 'sku' => 'DST-001'],
            ['category' => 'Dessert', 'name' => 'Pudding Coklat', 'price' => 15000, 'cost_price' => 6000, 'sku' => 'DST-002'],
        ];

        foreach ($products as $productData) {
            $categoryName = $productData['category'];
            unset($productData['category']);

            Product::firstOrCreate(
                ['outlet_id' => $outlet->id, 'sku' => $productData['sku']],
                array_merge($productData, [
                    'outlet_id'   => $outlet->id,
                    'category_id' => $categories[$categoryName]?->id,
                    'unit'        => 'pcs',
                    'track_stock' => true,
                    'is_active'   => true,
                ])
            );
        }
    }
}
