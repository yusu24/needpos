<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    protected $fillable = [
        'outlet_id',
        'name',
        'phone',
        'email',
        'address',
        'tier', // 'regular', 'silver', 'gold'
        'points',
        'total_spent',
        'joined_at',
    ];

    protected $casts = [
        'points' => 'integer',
        'total_spent' => 'decimal:2',
        'joined_at' => 'datetime',
    ];

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function returns(): HasMany
    {
        return $this->hasMany(CustomerReturn::class);
    }
}
