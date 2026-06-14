<?php
// app/Models/Stock.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Stock extends Model
{
    protected $table = 'stock';

    protected $fillable = [
        'product_id',
        'outlet_id',
        'quantity',
        'min_quantity',
    ];

    protected $casts = [
        'quantity'     => 'decimal:2',
        'min_quantity' => 'decimal:2',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    /**
     * Apakah stok di bawah threshold minimum?
     */
    public function isLow(): bool
    {
        return $this->quantity <= $this->min_quantity;
    }
}
