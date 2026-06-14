<?php
// database/seeders/RolePermissionSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Definisikan semua permissions untuk setiap menu dan aksi CRUD
        $permissions = [
            // Dashboard
            'view dashboard',

            // POS (Kasir)
            'view pos',
            'create transactions',

            // Kategori
            'view categories',
            'create categories',
            'edit categories',
            'delete categories',

            // Produk
            'view products',
            'create products',
            'edit products',
            'delete products',

            // Pricelist
            'view pricelists',
            'create pricelists',
            'edit pricelists',
            'delete pricelists',

            // Stok Barang
            'view stock',
            'adjust stock',

            // Penerimaan Barang
            'view receive items',
            'create receive items',

            // Opname Stok
            'view stock opname',
            'create stock opname',
            'finalize stock opname',
            'delete stock opname',

            // Retur ke Supplier
            'view supplier returns',
            'create supplier returns',
            'confirm supplier returns',
            'delete supplier returns',

            // Purchase Order
            'view purchase orders',
            'create purchase orders',
            'edit purchase orders',
            'update status purchase orders',

            // Supplier
            'view suppliers',
            'create suppliers',
            'edit suppliers',
            'delete suppliers',

            // Diskon & Promo
            'view discounts',
            'create discounts',
            'edit discounts',
            'delete discounts',

            // Pelanggan
            'view customers',
            'create customers',
            'edit customers',
            'delete customers',

            // Retur Penjualan
            'view customer returns',
            'create customer returns',
            'confirm customer returns',
            'delete customer returns',

            // Transaksi (Orders)
            'view transactions',
            'void transactions',

            // Pengguna (Users)
            'view users',
            'create users',
            'edit users',
            'delete users',

            // Roles & Permissions
            'view roles',
            'manage roles',

            // Laporan
            'view reports',
            'view profit loss report',

            // Pengaturan
            'view settings',
            'edit settings',
        ];

        // Buat permissions di database jika belum ada
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // 2. Definisikan Roles dan pemetaan permissions default
        $rolePermissions = [
            'owner' => $permissions, // Owner dapat semua permission
            
            'manager' => [
                'view dashboard',
                'view pos',
                'create transactions',
                'view categories',
                'create categories',
                'edit categories',
                'delete categories',
                'view products',
                'create products',
                'edit products',
                'delete products',
                'view pricelists',
                'create pricelists',
                'edit pricelists',
                'delete pricelists',
                'view stock',
                'adjust stock',
                'view receive items',
                'create receive items',
                'view stock opname',
                'create stock opname',
                'finalize stock opname',
                'delete stock opname',
                'view supplier returns',
                'create supplier returns',
                'confirm supplier returns',
                'delete supplier returns',
                'view purchase orders',
                'create purchase orders',
                'edit purchase orders',
                'update status purchase orders',
                'view suppliers',
                'create suppliers',
                'edit suppliers',
                'delete suppliers',
                'view discounts',
                'create discounts',
                'edit discounts',
                'delete discounts',
                'view customers',
                'create customers',
                'edit customers',
                'delete customers',
                'view customer returns',
                'create customer returns',
                'confirm customer returns',
                'delete customer returns',
                'view transactions',
                'void transactions',
                'view reports',
            ],

            'cashier' => [
                'view dashboard',
                'view pos',
                'create transactions',
            ],

            'stock_admin' => [
                'view dashboard',
                'view categories',
                'view products',
                'view stock',
                'adjust stock',
                'view receive items',
                'create receive items',
                'view stock opname',
                'create stock opname',
                'view supplier returns',
                'create supplier returns',
                'view purchase orders',
                'view suppliers',
            ],

            'purchasing' => [
                'view dashboard',
                'view receive items',
                'create receive items',
                'view supplier returns',
                'create supplier returns',
                'view purchase orders',
                'create purchase orders',
                'edit purchase orders',
                'update status purchase orders',
                'view suppliers',
                'create suppliers',
                'edit suppliers',
            ],
        ];

        foreach ($rolePermissions as $roleName => $perms) {
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
            $role->syncPermissions($perms);
        }
    }
}
