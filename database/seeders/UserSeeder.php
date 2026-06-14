<?php
// database/seeders/UserSeeder.php

namespace Database\Seeders;

use App\Models\Outlet;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $outlet = Outlet::where('name', 'Demo Outlet')->first();

        $users = [
            [
                'name'      => 'Owner Demo',
                'email'     => 'owner@demo.com',
                'password'  => Hash::make('password'),
                'outlet_id' => $outlet->id,
                'is_active' => true,
                'role'      => 'owner',
            ],
            [
                'name'      => 'Manager Demo',
                'email'     => 'manager@demo.com',
                'password'  => Hash::make('password'),
                'outlet_id' => $outlet->id,
                'is_active' => true,
                'role'      => 'manager',
            ],
            [
                'name'      => 'Kasir Demo',
                'email'     => 'cashier@demo.com',
                'password'  => Hash::make('password'),
                'outlet_id' => $outlet->id,
                'is_active' => true,
                'role'      => 'cashier',
            ],
            [
                'name'      => 'Stock Admin Demo',
                'email'     => 'stock@demo.com',
                'password'  => Hash::make('password'),
                'outlet_id' => $outlet->id,
                'is_active' => true,
                'role'      => 'stock_admin',
            ],
        ];

        foreach ($users as $userData) {
            $role = $userData['role'];
            unset($userData['role']);

            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                $userData
            );

            $user->syncRoles([$role]);
        }
    }
}
