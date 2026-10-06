<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserCanAccessAdminArea
{
    /**
     * Gate the admin area as a whole. Individual actions inside it are still
     * authorised by their own policies — this only decides who gets through
     * the door.
     *
     * A missing user or an unrecognised role means no access rather than an
     * error, so a half-written record can never produce a 500 here.
     */
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless(
            $request->user()?->role?->canAccessAdminArea() ?? false,
            403,
        );

        return $next($request);
    }
}
