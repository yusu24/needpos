<?php
// app/Models/Order.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'outlet_id',
        'user_id',
        'order_number',
        'status',
        'subtotal',
        'discount_amount',
        'tax_amount',
        'total_amount',
        'payment_method',
        'payment_amount',
        'change_amount',
        'discount_id',
        'customer_id',
        'pricelist_id',
        'note',
        'voided_at',
        'voided_by',
        'void_reason',
    ];

    protected $casts = [
        'subtotal'        => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tax_amount'      => 'decimal:2',
        'total_amount'    => 'decimal:2',
        'payment_amount'  => 'decimal:2',
        'change_amount'   => 'decimal:2',
        'voided_at'       => 'datetime',
    ];

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function pricelist(): BelongsTo
    {
        return $this->belongsTo(Pricelist::class);
    }

    public function voidedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'voided_by');
    }

    public function discount(): BelongsTo
    {
        return $this->belongsTo(Discount::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class, 'reference_id')
            ->where('reference_type', self::class);
    }

    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    public function isVoided(): bool
    {
        return $this->status === 'voided';
    }

    /**
     * Apakah kasir ini bisa void transaksi ini?
     * Kasir hanya bisa void transaksi sendiri di hari yang sama.
     */
    public function canBeVoidedBy(User $user): bool
    {
        if ($user->hasRole(['owner', 'manager'])) {
            return true;
        }

        // Cashier: hanya transaksi sendiri di hari ini
        return $user->id === $this->user_id
            && $this->created_at->isToday();
    }

    public function scopeForOutlet($query, int $outletId)
    {
        return $query->where('outlet_id', $outletId);
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }
}
