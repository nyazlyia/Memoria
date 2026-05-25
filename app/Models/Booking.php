<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Booking extends Model
{
    protected $fillable = [
        'photo_session_id',
        'booking_code',
        'booking_date',
        'booking_time',
        'duration_minutes',
        'pax',
        'location',
        'special_requests',
        'status',
        'cancelled_at',
        'cancellation_reason',
    ];

    protected $casts = [
        'booking_date' => 'date',
        'cancelled_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->booking_code)) {
                $model->booking_code = 'BK-' . strtoupper(Str::random(8));
            }
        });
    }

    public function photoSession(): BelongsTo
    {
        return $this->belongsTo(PhotoSession::class);
    }

    public function cancel(string $reason = ''): void
    {
        $this->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $reason,
        ]);
    }

    public function confirm(): void
    {
        $this->update(['status' => 'confirmed']);
    }

    public function complete(): void
    {
        $this->update(['status' => 'completed']);
    }
}
