<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PricelistItem extends Model
{
    protected $fillable = [
        'pricelist_id',
        'product_id',
        'price',
        'min_qty',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'min_qty' => 'integer',
    ];

    public function pricelist(): BelongsTo
    {
        return $this->belongsTo(Pricelist::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
