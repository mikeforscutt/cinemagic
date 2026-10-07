<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

final class StoreScreeningRequest extends ScreeningRequest
{
    protected function ignoredScreeningId(): ?int
    {
        return null;
    }
}
