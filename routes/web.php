<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PhotoBoothController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\BookingController;

// Photobooth routes
Route::prefix('api/photobooth')->group(function () {
    // Photo Session routes
    Route::post('/session', [PhotoBoothController::class, 'createSession']);
    Route::get('/session/{session}', [PhotoBoothController::class, 'getSession']);
    Route::post('/session/{session}/complete', [PhotoBoothController::class, 'completeSession']);
    Route::get('/session/{session}/download', [PhotoBoothController::class, 'downloadPhotos']);

    // Photo routes
    Route::post('/session/{session}/photo', [PhotoBoothController::class, 'capturePhoto']);
    Route::get('/session/{session}/photos', [PhotoBoothController::class, 'getPhotos']);
    Route::delete('/photo/{photo}', [PhotoBoothController::class, 'deletePhoto']);

    // Booking routes
    Route::post('/booking', [BookingController::class, 'createBooking']);
    Route::get('/booking/{booking}', [BookingController::class, 'getBooking']);
    Route::post('/booking/{booking}/confirm', [BookingController::class, 'confirmBooking']);
    Route::post('/booking/{booking}/cancel', [BookingController::class, 'cancelBooking']);
    Route::get('/session/{session}/booking', [BookingController::class, 'getSessionBooking']);

    // Payment routes
    Route::post('/payment/create/{session}', [PaymentController::class, 'createPayment']);
    Route::get('/payment/{session}', [PaymentController::class, 'getPayment']);
    Route::get('/payment/{session}/verify', [PaymentController::class, 'verifyPayment']);
    Route::post('/payment/notification', [PaymentController::class, 'notification']);
});

// Payment result pages
Route::get('/photobooth/payment/finish', [PaymentController::class, 'paymentFinish'])->name('payment.finish');
Route::get('/photobooth/payment/unfinish', [PaymentController::class, 'paymentUnfinish'])->name('payment.unfinish');
Route::get('/photobooth/payment/error', [PaymentController::class, 'paymentError'])->name('payment.error');

// Main app (React)
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');