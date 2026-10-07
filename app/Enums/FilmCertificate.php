<?php

declare(strict_types=1);

namespace App\Enums;

enum FilmCertificate: string
{
    case U = 'U';
    case PG = 'PG';
    case TwelveA = '12A';
    case Twelve = '12';
    case Fifteen = '15';
    case Eighteen = '18';

    public function label(): string
    {
        return match ($this) {
            self::U => 'U — suitable for all',
            self::PG => 'PG — parental guidance',
            self::TwelveA => '12A — under 12s with an adult',
            self::Twelve => '12 — 12 and over',
            self::Fifteen => '15 — 15 and over',
            self::Eighteen => '18 — adults only',
        };
    }

    /**
     * Shaped for a select element, the same way UserRole feeds the user form.
     *
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $case): array => [
                'value' => $case->value,
                'label' => $case->label(),
            ],
            self::cases(),
        );
    }
}
