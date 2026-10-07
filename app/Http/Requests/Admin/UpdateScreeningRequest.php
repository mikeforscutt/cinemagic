<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Models\Screening;

final class UpdateScreeningRequest extends ScreeningRequest
{
    /**
     * A screening never clashes with itself, so it's excluded from the
     * overlap search when editing.
     */
    protected function ignoredScreeningId(): ?int
    {
        $screening = $this->route('screening');

        return $screening instanceof Screening ? $screening->id : null;
    }
}
