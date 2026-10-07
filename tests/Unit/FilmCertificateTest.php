<?php

declare(strict_types=1);

use App\Enums\FilmCertificate;

it('gives every certificate a label', function (): void {
    foreach (FilmCertificate::cases() as $certificate) {
        expect($certificate->label())->not->toBeEmpty();
    }
});

it('offers every certificate as a select option', function (): void {
    $options = FilmCertificate::options();

    expect($options)->toHaveCount(count(FilmCertificate::cases()))
        ->and(array_column($options, 'value'))
        ->toContain('U', 'PG', '12A', '12', '15', '18');
});
