<?php
// app/Http/Controllers/Admin/RolePermissionController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionController extends Controller
{
    /**
     * Tampilkan semua Roles beserta permissions-nya.
     */
    public function index(): Response
    {
        $roles = Role::with('permissions')->get()->map(function ($role) {
            return [
                'id'          => $role->id,
                'name'        => $role->name,
                'permissions' => $role->permissions->pluck('name'),
            ];
        });

        $permissions = Permission::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Roles/Index', [
            'roles'       => $roles,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Simpan role baru.
     */
    public function storeRole(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:roles,name'],
        ]);

        Role::create(['name' => $request->name, 'guard_name' => 'web']);

        return back()->with('success', "Role '{$request->name}' berhasil ditambahkan.");
    }

    /**
     * Hapus role.
     */
    public function destroyRole(Role $role): RedirectResponse
    {
        $protected = ['owner', 'manager', 'cashier', 'stock_admin'];
        if (in_array($role->name, $protected)) {
            return back()->with('error', "Role '{$role->name}' adalah role sistem dan tidak dapat dihapus.");
        }

        $role->delete();
        return back()->with('success', "Role '{$role->name}' berhasil dihapus.");
    }

    /**
     * Simpan permission baru.
     */
    public function storePermission(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:permissions,name'],
        ]);

        Permission::create(['name' => $request->name, 'guard_name' => 'web']);

        return back()->with('success', "Permission '{$request->name}' berhasil ditambahkan.");
    }

    /**
     * Hapus permission.
     */
    public function destroyPermission(Permission $permission): RedirectResponse
    {
        $protected = [
            'view users', 'create users', 'edit users', 'delete users',
            'view roles', 'manage roles', 'view settings', 'edit settings', 'view dashboard'
        ];
        if (in_array($permission->name, $protected)) {
            return back()->with('error', "Permission '{$permission->name}' adalah permission sistem dan tidak dapat dihapus.");
        }

        $permission->delete();
        return back()->with('success', "Permission '{$permission->name}' berhasil dihapus.");
    }

    /**
     * Sinkronisasi permissions pada sebuah role.
     */
    public function syncPermissions(Request $request, Role $role): RedirectResponse
    {
        $request->validate([
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $role->syncPermissions($request->permissions ?? []);

        return back()->with('success', "Permissions untuk role '{$role->name}' berhasil diperbarui.");
    }
}
