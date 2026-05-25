<?php

namespace App\Http\Controllers;

use App\Models\PhotoSession;
use App\Models\Payment;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Transaction;

class PaymentController extends Controller
{
    public function __construct()
    {
        // Set Midtrans configuration
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$clientKey = config('services.midtrans.client_key');
        Config::$isProduction = config('services.midtrans.is_production');
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }

    /**
     * Create payment snap token
     */
    public function createPayment(Request $request, PhotoSession $session): JsonResponse
    {
        try {
            // Check if payment already exists
            $existingPayment = $session->payment;
            if ($existingPayment && $existingPayment->isPaid()) {
                return response()->json([
                    'success' => false,
                    'message' => 'This session is already paid',
                ], 400);
            }

            // Create or update payment
            $payment = $existingPayment ?? new Payment();
            
            $payment->fill([
                'photo_session_id' => $session->id,
                'amount' => $session->price,
                'currency' => 'IDR',
                'status' => 'pending',
                'expires_at' => now()->addHours(24),
            ]);

            $payment->save();

            // Prepare Midtrans transaction
            $transactionDetails = [
                'order_id' => $payment->order_id,
                'gross_amount' => (int) $payment->amount,
            ];

            $customerDetails = [
                'first_name' => $session->customer_name,
                'email' => $session->customer_email ?? 'noreply@photobooth.local',
                'phone' => $session->customer_phone ?? '0',
            ];

            $itemDetails = [
                [
                    'id' => $session->id,
                    'price' => (int) $session->price,
                    'quantity' => 1,
                    'name' => 'Photobooth Session - ' . $session->session_code,
                ]
            ];

            $payload = [
                'transaction_details' => $transactionDetails,
                'customer_details' => $customerDetails,
                'item_details' => $itemDetails,
                'callbacks' => [
                    'finish' => url('/photobooth/payment/finish'),
                    'unfinish' => url('/photobooth/payment/unfinish'),
                    'error' => url('/photobooth/payment/error'),
                ],
            ];

            // Generate Snap Token
            $snapToken = Snap::getSnapToken($payload);

            return response()->json([
                'success' => true,
                'snap_token' => $snapToken,
                'payment' => $payment,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get payment details
     */
    public function getPayment(PhotoSession $session): JsonResponse
    {
        $payment = $session->payment;

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'No payment found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'payment' => $payment,
            'client_key' => config('services.midtrans.client_key'),
        ]);
    }

    /**
     * Handle payment notification from Midtrans
     */
    public function notification(Request $request): JsonResponse
    {
        try {
            $notif = Transaction::getStatus($request->order_id);

            $payment = Payment::where('order_id', $notif->order_id)->firstOrFail();

            // Store Midtrans response
            $payment->update([
                'midtrans_response' => json_decode(json_encode($notif), true),
                'transaction_id' => $notif->transaction_id ?? null,
            ]);

            // Handle payment status
            if ($notif->status == 'settlement' || $notif->status == 'capture') {
                $payment->markAsPaid($notif->transaction_id, $notif->payment_type);
            } elseif ($notif->status == 'denied' || $notif->status == 'failure') {
                $payment->markAsFailed();
            } elseif ($notif->status == 'expired') {
                $payment->markAsExpired();
            }

            return response()->json([
                'success' => true,
                'message' => 'Notification processed',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error processing notification: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Verify payment status (for polling)
     */
    public function verifyPayment(PhotoSession $session): JsonResponse
    {
        try {
            $payment = $session->payment;

            if (!$payment) {
                return response()->json([
                    'success' => false,
                    'message' => 'No payment found',
                ], 404);
            }

            // Check status with Midtrans
            if (!$payment->isPaid() && !$payment->hasExpired()) {
                try {
                    $status = Transaction::status($payment->order_id);
                    
                    if ($status->status_code == 200 && ($status->transaction_status == 'settlement' || $status->transaction_status == 'capture')) {
                        $payment->markAsPaid($status->transaction_id, $status->payment_type);
                    }
                } catch (\Exception $e) {
                    // Silently fail, return current payment status
                }
            }

            return response()->json([
                'success' => true,
                'payment' => $payment,
                'is_paid' => $payment->isPaid(),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error verifying payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Payment finish page
     */
    public function paymentFinish(Request $request)
    {
        $order_id = $request->order_id;
        
        try {
            $payment = Payment::where('order_id', $order_id)->firstOrFail();
            
            return view('photobooth.payment-result', [
                'payment' => $payment,
                'status' => 'success',
            ]);
        } catch (\Exception $e) {
            return view('photobooth.payment-result', [
                'status' => 'error',
                'message' => 'Payment not found',
            ]);
        }
    }

    /**
     * Payment unfinish page
     */
    public function paymentUnfinish(Request $request)
    {
        return view('photobooth.payment-result', [
            'status' => 'unfinish',
            'message' => 'Payment pending',
        ]);
    }

    /**
     * Payment error page
     */
    public function paymentError(Request $request)
    {
        return view('photobooth.payment-result', [
            'status' => 'error',
            'message' => 'Payment failed',
        ]);
    }
}
