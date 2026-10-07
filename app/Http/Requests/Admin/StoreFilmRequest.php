<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Enums\FilmCertificate;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

final class StoreFilmRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'slug' => Str::slug((string) $this->input('title')),
        ]);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('films', 'slug')],
            'synopsis' => ['required', 'string', 'max:5000'],
            'runtime_minutes' => ['required', 'integer', 'min:1', 'max:600'],
            'certificate' => ['required', Rule::enum(FilmCertificate::class)],
            'release_date' => ['required', 'date'],
            'director' => ['required', 'string', 'max:255'],
            'genres' => ['required', 'array', 'min:1', 'max:5'],
            'genres.*' => ['required', 'string', 'max:40'],
            'cast_list' => ['required', 'array', 'min:1', 'max:20'],
            'cast_list.*' => ['required', 'string', 'max:120'],
            'poster_path' => ['required', 'string', 'max:2048', 'url'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'slug.unique' => 'A film with this title already exists.',
        ];
    }
}
