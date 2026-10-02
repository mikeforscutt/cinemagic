<?php

use App\Http\Controllers\BookingController;
use App\Http\Controllers\ScreeningController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/screenings', [ScreeningController::class, 'index'])->name('screenings.index');
Route::get('/screenings/{screening}', [ScreeningController::class, 'show'])->name('screenings.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/bookings', [BookingController::class, 'index'])->name('bookings.index');
    Route::get('/bookings/{booking}', [BookingController::class, 'show'])->name('bookings.show');
    Route::post('/screenings/{screening}/hold', [BookingController::class, 'hold'])->name('bookings.hold');
    Route::post('/bookings/{booking}/confirm', [BookingController::class, 'confirm'])->name('bookings.confirm');
    Route::delete('/bookings/{booking}', [BookingController::class, 'cancel'])->name('bookings.cancel');
});

require __DIR__.'/settings.php';
