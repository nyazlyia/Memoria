<?php

namespace App\Http\Controllers;

use App\Models\PhotoSession;
use App\Models\Photo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\JsonResponse;

class PhotoBoothController extends Controller
{
    /**
     * Display photobooth interface
     */
    public function index()
    {
        return view('photobooth.index');
    }

    /**
     * Create a new photo session
     */
    public function createSession(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'nullable|email',
            'customer_phone' => 'nullable|string',
            'max_photos' => 'integer|min:1|max:10|default:4',
            'price' => 'numeric|min:0|default:50000',
        ]);

        $session = PhotoSession::create([
            ...$validated,
            'status' => 'pending',
            'price' => $validated['price'] ?? 50000,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Session created successfully',
            'session' => $session,
        ]);
    }

    /**
     * Get session details
     */
    public function getSession(PhotoSession $session): JsonResponse
    {
        return response()->json([
            'success' => true,
            'session' => $session->load('photos'),
            'can_add_photo' => $session->canAddPhoto(),
        ]);
    }

    /**
     * Capture and save photo
     */
    public function capturePhoto(Request $request, PhotoSession $session): JsonResponse
    {
        try {
            $validated = $request->validate([
                'image' => 'required|string', // base64 image
            ]);

            if (!$session->canAddPhoto()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Maximum photos reached',
                ], 400);
            }

            // Decode base64 image
            $imageData = $validated['image'];
            
            // Remove data URI scheme if present
            if (strpos($imageData, 'data:image') !== false) {
                $imageData = substr($imageData, strpos($imageData, ',') + 1);
            }

            $imageBinary = base64_decode($imageData);
            
            if (!$imageBinary) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid image data',
                ], 400);
            }

            // Create filename
            $fileName = 'photobooth_' . $session->id . '_' . time() . '_' . uniqid() . '.jpg';
            $path = 'photobooth/' . $session->session_code . '/' . $fileName;

            // Save to storage
            Storage::disk('public')->put($path, $imageBinary);

            // Create photo record
            $photo = Photo::create([
                'photo_session_id' => $session->id,
                'file_path' => $path,
                'file_name' => $fileName,
                'mime_type' => 'image/jpeg',
                'file_size' => strlen($imageBinary),
                'sequence_number' => $session->photos()->count() + 1,
                'is_selected' => true,
            ]);

            // Update session photo count
            $session->increment('photo_count');

            return response()->json([
                'success' => true,
                'message' => 'Photo captured successfully',
                'photo' => $photo,
                'session' => $session->fresh(),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error capturing photo: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all photos in session
     */
    public function getPhotos(PhotoSession $session): JsonResponse
    {
        $photos = $session->photos()->orderBy('sequence_number')->get()->map(function ($photo) {
            return [
                'id' => $photo->id,
                'url' => $photo->url,
                'file_name' => $photo->file_name,
                'sequence_number' => $photo->sequence_number,
                'is_selected' => $photo->is_selected,
                'created_at' => $photo->created_at,
            ];
        });

        return response()->json([
            'success' => true,
            'photos' => $photos,
            'total' => $photos->count(),
        ]);
    }

    /**
     * Delete a photo
     */
    public function deletePhoto(Photo $photo): JsonResponse
    {
        try {
            // Delete file from storage
            if (Storage::disk('public')->exists($photo->file_path)) {
                Storage::disk('public')->delete($photo->file_path);
            }

            $session = $photo->photoSession;
            $photo->delete();
            $session->decrement('photo_count');

            return response()->json([
                'success' => true,
                'message' => 'Photo deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting photo: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Complete session and prepare for payment
     */
    public function completeSession(PhotoSession $session): JsonResponse
    {
        if ($session->photo_count === 0) {
            return response()->json([
                'success' => false,
                'message' => 'Please capture at least one photo',
            ], 400);
        }

        $session->markAsCompleted();

        return response()->json([
            'success' => true,
            'message' => 'Session completed successfully',
            'session' => $session,
        ]);
    }

    /**
     * Download all photos as zip
     */
    public function downloadPhotos(PhotoSession $session)
    {
        $photos = $session->photos()->get();

        if ($photos->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No photos to download',
            ], 400);
        }

        $zipFileName = 'photobooth_' . $session->session_code . '.zip';
        $zipPath = storage_path('app/temp/' . $zipFileName);

        // Create zip
        $zip = new \ZipArchive();
        $zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE);

        foreach ($photos as $photo) {
            $filePath = Storage::disk('public')->path($photo->file_path);
            if (file_exists($filePath)) {
                $zip->addFile($filePath, $photo->file_name);
            }
        }

        $zip->close();

        return response()->download($zipPath)->deleteFileAfterSend(true);
    }
}
