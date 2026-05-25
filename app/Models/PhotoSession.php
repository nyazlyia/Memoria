<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class PhotoSession extends Model
{
    protected $fillable = [
        'user_id',
        'session_code',
        'customer_name',
        'customer_email',
        'customer_phone',
        'photo_count',
        'max_photos',
        'price',
        'status',
        'started_at',
        'completed_at',
        'notes',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'price' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->session_code)) {
                $model->session_code = 'PS-' . strtoupper(Str::random(8));
            }
            if (empty($model->started_at)) {
                $model->started_at = now();
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(Photo::class);
    }

    public function booking(): HasOne
    {
        return $this->hasOne(Booking::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function getPhotoCountAttribute()
    {
        return $this->photos()->count();
    }

    public function canAddPhoto(): bool
    {
        return $this->photo_count < $this->max_photos && $this->status !== 'completed';
    }

    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }
}
