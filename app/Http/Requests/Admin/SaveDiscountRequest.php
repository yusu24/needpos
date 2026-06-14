<?php
// app/Http/Requests/Admin/SaveDiscountRequest.php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SaveDiscountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $discountId = $this->discount ? $this->discount->id : 'NULL';
        $outletId = $this->user()->outlet_id;

        return [
            'code'         => "required|string|max:50|unique:discounts,code,{$discountId},id,outlet_id,{$outletId}",
            'name'         => 'required|string|max:100',
            'type'         => 'required|in:percentage,flat,bogo',
            'value'        => 'required|numeric|min:0',
            'min_purchase' => 'nullable|numeric|min:0',
            'max_uses'     => 'nullable|integer|min:1',
            'is_active'    => 'boolean',
            'starts_at'    => 'nullable|date',
            'expires_at'   => 'nullable|date|after_or_equal:starts_at',
        ];
    }
}
