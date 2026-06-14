<?php
// app/Http/Requests/Admin/SaveProductRequest.php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SaveProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->product ? $this->product->id : 'NULL';
        $outletId = $this->user()->outlet_id;

        return [
            'category_id'   => 'required|exists:categories,id',
            'name'          => 'required|string|max:150',
            'sku'           => "nullable|string|max:50|unique:products,sku,{$productId},id,outlet_id,{$outletId}",
            'barcode'       => "nullable|string|max:100|unique:products,barcode,{$productId},id,outlet_id,{$outletId}",
            'price'         => 'required|numeric|min:0',
            'cost_price'    => 'required|numeric|min:0',
            'image'         => 'nullable|string',
            'image_file'    => 'nullable|image|max:2048',
            'description'   => 'nullable|string',
            'unit'          => 'required|string|max:20',
            'track_stock'   => 'boolean',
            'is_active'     => 'boolean',
            'initial_stock' => 'nullable|numeric|min:0',
            'min_stock'     => 'nullable|numeric|min:0',
        ];
    }
}
