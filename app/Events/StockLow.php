<?php
// app/Events/StockLow.php

namespace App\Events;

use App\Models\Product;
use App\Models\Stock;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StockLow implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Product $product,
        public readonly Stock $stock
    ) {}

    public function broadcastOn(): array
    {
        // Channel per outlet agar hanya user outlet tersebut yang menerima
        return [
            new Channel("outlet.{$this->product->outlet_id}.alerts"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'stock.low';
    }

    public function broadcastWith(): array
    {
        return [
            'product_id'   => $this->product->id,
            'product_name' => $this->product->name,
            'quantity'     => $this->stock->quantity,
            'min_quantity' => $this->stock->min_quantity,
            'outlet_id'    => $this->product->outlet_id,
        ];
    }
}
