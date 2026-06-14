<?php
// database/seeders/DiscountSeeder.php

namespace Database\Seeders;

use App\Models\Discount;
use App\Models\Outlet;
use Illuminate\Database\Seeder;

class DiscountSeeder extends Seeder
{
    public function run(): void
    {
        $outlet = Outlet::where('name', 'Demo Outlet')->first();

        $discounts = [
            [
                'code'         => 'DISC10',
                'name'         => 'Diskon 10%',
                'type'         => 'percentage',
                'value'        => 10,
                'min_purchase' => 50000,
                'max_uses'     => null,
                'is_active'    => true,
                'starts_at'    => null,
                'expires_at'   => null,
            ],
            [
                'code'         => 'FLAT20K',
                'name'         => 'Potongan Rp20.000',
                'type'         => 'flat',
                'value'        => 20000,
                'min_purchase' => 100000,
                'max_uses'     => 50,
                'is_active'    => true,
                'starts_at'    => null,
                'expires_at'   => now()->addMonths(3),
            ],
        ];

        foreach ($discounts as $discount) {
            Discount::firstOrCreate(
                ['outlet_id' => $outlet->id, 'code' => $discount['code']],
                array_merge($discount, ['outlet_id' => $outlet->id])
            );
        }
    }
}
