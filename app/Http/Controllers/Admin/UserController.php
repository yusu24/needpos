<?php
// app/Http/Controllers/Admin/UserController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * List all users/employees in the outlet.
     */
    public function index(Request $request): Response
    {
        $outletId = $request->user()->outlet_id;
        $perPage = min((int) $request->input('per_page', 15), 100);

        $users = User::forOutlet($outletId)
            ->with('roles:id,name')
            ->when($request->search, fn ($q) =>
                $q->where(function ($inner) use ($request) {
                    $inner->where('name', 'like', "%{$request->search}%")
                          ->orWhere('email', 'like', "%{$request->search}%");
                })
            )
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Pengguna/Index', [
            'users'   => $users,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    /**
     * Show form to create new user.
     */
    public function create(): Response
    {
        $roles = Role::get(['id', 'name']);
        return Inertia::render('Pengguna/Form', [
            'roles' => $roles,
        ]);
    }

    /**
     * Store new user.
     */
    public function store(SaveUserRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['outlet_id'] = $request->user()->outlet_id;
        $data['password'] = Hash::make($data['password']);

        $roleName = $data['role'];
        unset($data['role']);

        $newUser = User::create($data);
        $newUser->assignRole($roleName);

        return redirect()->route('admin.users.index')->with('success', 'Pengguna berhasil ditambahkan.');
    }

    /**
     * Show form to edit existing user.
     */
    public function edit(Request $request, User $userMember): Response
    {
        // Avoid modifying the authenticated user from this screen unless scoped
        abort_unless($userMember->outlet_id === $request->user()->outlet_id, 403);

        $roles = Role::get(['id', 'name']);
        $userMember->load('roles:id,name');

        return Inertia::render('Pengguna/Form', [
            'userMember' => $userMember,
            'roles'      => $roles,
        ]);
    }

    /**
     * Update user.
     */
    public function update(SaveUserRequest $request, User $userMember): RedirectResponse
    {
        abort_unless($userMember->outlet_id === $request->user()->outlet_id, 403);

        $data = $request->validated();

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $roleName = $data['role'];
        unset($data['role']);

        $userMember->update($data);
        $userMember->syncRoles([$roleName]);

        return redirect()->route('admin.users.index')->with('success', 'Pengguna berhasil diperbarui.');
    }

    /**
     * Delete user.
     */
    public function destroy(Request $request, User $userMember): RedirectResponse
    {
        abort_unless($userMember->outlet_id === $request->user()->outlet_id, 403);

        // Prevent deleting oneself
        if ($userMember->id === $request->user()->id) {
            return redirect()->route('admin.users.index')->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        $userMember->delete();

        return redirect()->route('admin.users.index')->with('success', 'Pengguna berhasil dihapus.');
    }
}
