<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseReceiveItem extends Model
{
    protected $fillable = [
        'receive_id',
        'po_item_id',
        'product_id',
        'qty_received',
        'unit_price',
        'subtotal',
    ];

    protected $casts = [
        'qty_received' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    public function purchaseReceive(): BelongsTo
    {
        return $this->belongsTo(PurchaseReceive::class, 'receive_id');
    }

    public function poItem(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrderItem::class, 'po_item_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
