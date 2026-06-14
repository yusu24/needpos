<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        if ($user) {
            $user->load(['roles', 'outlet']);
            $userArray = $user->toArray();
            $userArray['roles_list'] = $user->roles->pluck('name')->toArray();
            $userArray['permissions_list'] = $user->getAllPermissions()->pluck('name')->toArray();
        } else {
            $userArray = null;
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $userArray,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
            ],
        ];
    }
}
