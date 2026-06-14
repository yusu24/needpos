<?php
// app/Http/Requests/Admin/AdjustStockRequest.php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class AdjustStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => 'required|exists:products,id',
            'type'       => 'required|in:in,adjustment',
            'quantity'   => 'required|numeric|min:0',
            'note'       => 'nullable|string|max:255',
        ];
    }
}
