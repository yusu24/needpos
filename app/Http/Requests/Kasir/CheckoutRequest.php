<?php
// app/Http/Requests/Kasir/CheckoutRequest.php

namespace App\Http\Requests\Kasir;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(['owner', 'manager', 'cashier']);
    }

    public function rules(): array
    {
        return [
            'items'                  => ['required', 'array', 'min:1'],
            'items.*.product_id'     => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity'       => ['required', 'numeric', 'min:0.01'],
            'payment_method'         => ['required', 'in:cash,qris,card,transfer'],
            'payment_amount'         => ['required', 'numeric', 'min:0'],
            'discount_code'          => ['nullable', 'string', 'max:50'],
            'note'                   => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'items.required'              => 'Keranjang belanja kosong.',
            'items.min'                   => 'Minimal 1 produk harus dipilih.',
            'items.*.product_id.exists'   => 'Produk tidak ditemukan.',
            'items.*.quantity.min'        => 'Jumlah produk minimal 0.01.',
            'payment_method.in'           => 'Metode pembayaran tidak valid.',
            'payment_amount.min'          => 'Nominal pembayaran tidak boleh 0.',
        ];
    }
}
