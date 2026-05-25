<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Payment extends Model
{
    protected $fillable = [
        'photo_session_id',
        'transaction_id',
        'order_id',
        'amount',
        'currency',
        'payment_method',
        'status',
        'payment_type',
        'midtrans_response',
        'paid_at',
        'expires_at',
        'receipt_url',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'expires_at' => 'datetime',
        'midtrans_response' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->order_id)) {
                $model->order_id = 'ORD-' . date('YmdHis') . '-' . strtoupper(Str::random(6));
            }
        });
    }

    public function photoSession(): BelongsTo
    {
        return $this->belongsTo(PhotoSession::class);
    }

    public function markAsPaid(string $transactionId = '', string $paymentMethod = ''): void
    {
        $this->update([
            'status' => 'paid',
            'transaction_id' => $transactionId,
            'payment_method' => $paymentMethod,
            'paid_at' => now(),
        ]);

        $this->photoSession()->update(['status' => 'paid']);
    }

    public function markAsFailed(): void
    {
        $this->update(['status' => 'failed']);
    }

    public function markAsExpired(): void
    {
        $this->update(['status' => 'expired']);
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    public function hasExpired(): bool
    {
        return $this->expires_at && now()->isAfter($this->expires_at);
    }
}
