<?php
// app/Http/Requests/Admin/VoidOrderRequest.php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class VoidOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Controller akan cek apakah kasir bisa void order spesifik ini
        return $this->user()->hasRole(['owner', 'manager', 'cashier']);
    }

    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'min:5', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'reason.required' => 'Alasan void wajib diisi.',
            'reason.min'      => 'Alasan void minimal 5 karakter.',
        ];
    }
}
