<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOutletAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        // Jika user adalah owner, perbolehkan lewat (bisa akses semua outlet atau outlet tersendiri)
        if ($user->hasRole('owner')) {
            return $next($request);
        }

        // Kasir, manager, dan stock_admin harus memiliki outlet_id yang terasosiasi dan aktif
        if (!$user->outlet_id) {
            abort(403, 'User ini tidak terasosiasi dengan outlet manapun.');
        }

        if (!$user->outlet || !$user->outlet->is_active) {
            abort(403, 'Outlet yang terasosiasi dengan user ini sedang tidak aktif.');
        }

        // Opsional: jika request membawa parameter outlet_id, pastikan cocok dengan user's outlet_id
        if ($request->has('outlet_id') && (int)$request->input('outlet_id') !== (int)$user->outlet_id) {
            abort(403, 'Anda tidak memiliki akses ke data outlet ini.');
        }

        return $next($request);
    }
}
