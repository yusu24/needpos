<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

class CustomerPointService
{
    /**
     * Award points and update customer tier based on paid transaction.
     */
    public function awardPointsForOrder(Order $order): void
    {
        if (!$order->customer_id || $order->status !== 'paid') {
            return;
        }

        DB::transaction(function () use ($order) {
            $customer = Customer::where('id', $order->customer_id)
                ->lockForUpdate()
                ->first();

            if (!$customer) {
                return;
            }

            $outlet = $order->outlet;
            $pointsRatio = $outlet ? (int) $outlet->points_ratio : 10000;
            if ($pointsRatio <= 0) {
                $pointsRatio = 10000;
            }

            // Calculate new points
            $earnedPoints = (int) floor($order->total_amount / $pointsRatio);

            // Update points and total spending
            $customer->points += $earnedPoints;
            $customer->total_spent += $order->total_amount;

            // Update tier based on cumulative total spending
            // Rule 25: Regular < 1jt, Silver 1–5jt, Gold > 5jt
            $totalSpent = (float) $customer->total_spent;
            if ($totalSpent >= 5000000.0) {
                $customer->tier = 'gold';
            } elseif ($totalSpent >= 1000000.0) {
                $customer->tier = 'silver';
            } else {
                $customer->tier = 'regular';
            }

            $customer->save();
        });
    }

    /**
     * Deduct points if an order is voided.
     */
    public function deductPointsForVoid(Order $order): void
    {
        if (!$order->customer_id || $order->status !== 'voided') {
            return;
        }

        DB::transaction(function () use ($order) {
            $customer = Customer::where('id', $order->customer_id)
                ->lockForUpdate()
                ->first();

            if (!$customer) {
                return;
            }

            $outlet = $order->outlet;
            $pointsRatio = $outlet ? (int) $outlet->points_ratio : 10000;
            if ($pointsRatio <= 0) {
                $pointsRatio = 10000;
            }

            $earnedPoints = (int) floor($order->total_amount / $pointsRatio);

            // Deduct points and adjust total spent
            $customer->points = max(0, $customer->points - $earnedPoints);
            $customer->total_spent = max(0, $customer->total_spent - $order->total_amount);

            // Recalculate tier
            $totalSpent = (float) $customer->total_spent;
            if ($totalSpent >= 5000000.0) {
                $customer->tier = 'gold';
            } elseif ($totalSpent >= 1000000.0) {
                $customer->tier = 'silver';
            } else {
                $customer->tier = 'regular';
            }

            $customer->save();
        });
    }
}
