<?php

namespace App\Http\Controllers;

use App\Models\PhotoSession;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BookingController extends Controller
{
    /**
     * Create a booking
     */
    public function createBooking(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'photo_session_id' => 'required|exists:photo_sessions,id',
            'booking_date' => 'required|date|after_or_equal:today',
            'booking_time' => 'required|date_format:H:i',
            'duration_minutes' => 'integer|min:15|default:30',
            'pax' => 'integer|min:1|default:1',
            'location' => 'nullable|string|max:255',
            'special_requests' => 'nullable|string',
        ]);

        $session = PhotoSession::findOrFail($validated['photo_session_id']);

        $booking = Booking::create([
            ...$validated,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Booking created successfully',
            'booking' => $booking,
        ]);
    }

    /**
     * Get booking details
     */
    public function getBooking(Booking $booking): JsonResponse
    {
        return response()->json([
            'success' => true,
            'booking' => $booking,
        ]);
    }

    /**
     * Confirm booking
     */
    public function confirmBooking(Booking $booking): JsonResponse
    {
        $booking->confirm();

        return response()->json([
            'success' => true,
            'message' => 'Booking confirmed',
            'booking' => $booking,
        ]);
    }

    /**
     * Cancel booking
     */
    public function cancelBooking(Request $request, Booking $booking): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'nullable|string',
        ]);

        $booking->cancel($validated['reason'] ?? '');

        return response()->json([
            'success' => true,
            'message' => 'Booking cancelled',
            'booking' => $booking,
        ]);
    }

    /**
     * Get session bookings
     */
    public function getSessionBooking(PhotoSession $session): JsonResponse
    {
        $booking = $session->booking;

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'No booking found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'booking' => $booking,
        ]);
    }
}
