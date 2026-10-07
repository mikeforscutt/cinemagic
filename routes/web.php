<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FilmController as AdminFilmController;
use App\Http\Controllers\Admin\ScreeningController as AdminScreeningController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\FilmController;
use App\Http\Controllers\ScreeningController;
use Illuminate\Support\Facades\Route;

Route::get('/', [FilmController::class, 'home'])->name('home');
Route::get('/films/{film:slug}', [FilmController::class, 'show'])->name('films.show');

Route::get('/screenings', [ScreeningController::class, 'index'])->name('screenings.index');
Route::get('/screenings/{screening}', [ScreeningController::class, 'show'])->name('screenings.show');

Route::middleware(['auth'])->group(function () {

    Route::get('/bookings', [BookingController::class, 'index'])->name('bookings.index');
    Route::get('/bookings/{booking}', [BookingController::class, 'show'])->name('bookings.show');
    Route::post('/screenings/{screening}/hold', [BookingController::class, 'hold'])->name('bookings.hold');
    Route::post('/bookings/{booking}/confirm', [BookingController::class, 'confirm'])->name('bookings.confirm');
    Route::delete('/bookings/{booking}', [BookingController::class, 'cancel'])->name('bookings.cancel');
});

Route::middleware(['auth', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
        Route::resource('users', AdminUserController::class)->except(['show']);
        Route::resource('films', AdminFilmController::class)->except(['show']);
        Route::resource('screenings', AdminScreeningController::class)->except(['show']);
    });

require __DIR__.'/settings.php';
