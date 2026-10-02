<?php

namespace App\Http\Requests;

use App\Enums\TicketType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class HoldSeatsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            // Eight is a common per-transaction limit at real cinemas, and it
            // stops one person holding an entire screen.
            'seat_ids' => ['required', 'array', 'min:1', 'max:8'],
            'seat_ids.*' => ['integer', 'exists:seats,id'],
            'ticket_type' => ['nullable', Rule::enum(TicketType::class)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'seat_ids.required' => 'Please choose at least one seat.',
            'seat_ids.max' => 'You can book up to eight seats at a time.',
        ];
    }
}
