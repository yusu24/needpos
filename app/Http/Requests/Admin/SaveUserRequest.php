<?php
// app/Http/Requests/Admin/SaveUserRequest.php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SaveUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Parameter name for the route is user_member to avoid collision with request->user()
        $routeUser = $this->route('user_member');
        $userId = $routeUser ? $routeUser->id : 'NULL';

        return [
            'name'      => 'required|string|max:255',
            'email'     => "required|string|email|max:255|unique:users,email,{$userId}",
            'password'  => $userId === 'NULL' ? 'required|string|min:8' : 'nullable|string|min:8',
            'is_active' => 'boolean',
            'role'      => 'required|string|in:owner,manager,cashier,stock_admin',
        ];
    }
}
