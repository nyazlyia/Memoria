<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Photo extends Model
{
    protected $fillable = [
        'photo_session_id',
        'file_path',
        'file_name',
        'mime_type',
        'file_size',
        'sequence_number',
        'is_selected',
        'effects',
    ];

    protected $casts = [
        'is_selected' => 'boolean',
        'file_size' => 'integer',
        'sequence_number' => 'integer',
        'effects' => 'array',
    ];

    public function photoSession(): BelongsTo
    {
        return $this->belongsTo(PhotoSession::class);
    }

    public function getUrlAttribute(): string
    {
        return asset('storage/' . $this->file_path);
    }

    public function getFileSizeInMBAttribute(): string
    {
        $mb = $this->file_size / (1024 * 1024);
        return number_format($mb, 2) . ' MB';
    }
}
