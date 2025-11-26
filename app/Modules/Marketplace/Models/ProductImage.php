<?php

namespace App\Modules\Marketplace\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductImage extends Model
{
    use HasFactory;

    protected $table = 'marketplace_product_images';

    protected $fillable = [
        'product_id',
        'image_path',
        'alt_text',
        'sort_order',
        'is_primary',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'is_primary' => 'boolean',
    ];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        if (!$this->image_path) {
            return null;
        }

        $path = $this->image_path;

        // Clean double storage slash anywhere in the path
        if (str_contains($path, '/storage//storage/')) {
            $path = str_replace('/storage//storage/', '/storage/', $path);
        }

        // If it's already a full URL, return it
        if (filter_var($path, FILTER_VALIDATE_URL)) {
            return $path;
        }

        // Clean relative path
        $path = ltrim($path, '/');
        
        // Remove all occurrences of 'storage/' from the beginning
        while (str_starts_with($path, 'storage/')) {
            $path = substr($path, 8);
        }

        return asset('storage/' . $path);
    }

    /**
     * Get the relative storage path for internal use (e.g., deletion)
     * This should return the path relative to the 'public' disk root.
     */
    public function getStoragePathAttribute()
    {
        if (!$this->image_path) {
            return null;
        }

        $path = $this->image_path;

        // Clean double storage slash
        if (str_contains($path, '/storage//storage/')) {
            $path = str_replace('/storage//storage/', '/storage/', $path);
        }

        // If it's a full URL, try to extract the relative path
        if (filter_var($path, FILTER_VALIDATE_URL)) {
            // Use a simple search for /storage/ to avoid calling asset() in a loop
            $pos = strpos($path, '/storage/');
            if ($pos !== false) {
                 return substr($path, $pos + 9);
            }
        }

        // Clean relative path
        $path = ltrim($path, '/');
        while (str_starts_with($path, 'storage/')) {
            $path = substr($path, 8);
        }

        return $path;
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
