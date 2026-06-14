<?php
// database/seeders/OutletSeeder.php

namespace Database\Seeders;

use App\Models\Outlet;
use Illuminate\Database\Seeder;

class OutletSeeder extends Seeder
{
    public function run(): void
    {
        Outlet::firstOrCreate(
            ['name' => 'Demo Outlet'],
            [
                'address'  => 'Jl. Sudirman No. 1, Jakarta Pusat',
                'phone'    => '021-12345678',
                'tax_rate' => 11.00,
                'is_active'=> true,
            ]
        );
    }
}
