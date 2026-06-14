<?php
// database/seeders/StockSeeder.php

namespace Database\Seeders;

use App\Models\Outlet;
use App\Models\Product;
use App\Models\Stock;
use Illuminate\Database\Seeder;

class StockSeeder extends Seeder
{
    public function run(): void
    {
        $outlet   = Outlet::where('name', 'Demo Outlet')->first();
        $products = Product::where('outlet_id', $outlet->id)->get();

        foreach ($products as $product) {
            Stock::firstOrCreate(
                ['product_id' => $product->id, 'outlet_id' => $outlet->id],
                [
                    'quantity'     => rand(20, 100),
                    'min_quantity' => 10,
                ]
            );
        }
    }
}
