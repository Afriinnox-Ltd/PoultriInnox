<?php

namespace App\Modules\Marketplace\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    use HasFactory;

    protected $table = 'marketplace_products';

    protected $fillable = [
        'vendor_id',
        'category_id',
        'name',
        'slug',
        'description',
        'short_description',
        'sku',
        'price',
        'compare_price',
        'cost_price',
        'stock_quantity',
        'minimum_stock',
        'track_inventory',
        'allow_backorders',
        'weight',
        'dimensions',
        'unit_of_measure',
        'minimum_order_quantity',
        'is_negotiable',
        'maximum_order_quantity',
        'suitable_for_breeds',
        'suitable_for_ages',
        'product_type',
        'nutritional_info',
        'active_ingredients',
        'meta_title',
        'meta_description',
        'tags',
        'status',
        'is_featured',
        'requires_prescription',
        'available_from',
        'available_until',
        'rating',
        'total_reviews',
        'total_sales',
        'view_count',
        'requires_shipping',
        'shipping_weight',
        'free_shipping',
        'shipping_cost',

        'payment_methods',
        'shipping_option',
        'video_path',
        'extra_fee',
        'delivery_time',
        'return_policy',
        'additional_info',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'compare_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'weight' => 'decimal:2',
        'shipping_weight' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'track_inventory' => 'boolean',
        'allow_backorders' => 'boolean',
        'is_featured' => 'boolean',
        'is_negotiable' => 'boolean',
        'requires_prescription' => 'boolean',
        'requires_shipping' => 'boolean',
        'free_shipping' => 'boolean',
        'dimensions' => 'array',
        'suitable_for_breeds' => 'array',
        'suitable_for_ages' => 'array',
        'nutritional_info' => 'array',
        'active_ingredients' => 'array',
        'tags' => 'array',
        'rating' => 'decimal:2',
        'view_count' => 'integer',
        'total_sales' => 'integer',
        'available_from' => 'datetime',
        'available_until' => 'datetime',
        'payment_methods' => 'array',
        'extra_fee' => 'decimal:2',

    ];

    protected static function boot()
    {
        parent::boot();

        // Automatically delete associated images when product is deleted
        static::deleting(function ($product) {
            foreach ($product->images as $image) {
                if ($image->image_path) {
                    // Convert URL back to relative path
                    $relativePath = str_replace('/storage/', '', $image->image_path);

                    // Delete file from storage if it exists
                    if (Storage::disk('public')->exists($relativePath)) {
                        Storage::disk('public')->delete($relativePath);
                    }
                }

                // Delete the image record
                $image->delete();
            }

            // Delete associated video if exists
            if ($product->video_path) {
                $videoPath = str_replace('/storage/', '', $product->video_path);
                if (Storage::disk('public')->exists($videoPath)) {
                    Storage::disk('public')->delete($videoPath);
                }
            }
        });
    }

    /**
     * Get the vendor that owns the product
     */
    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    /**
     * Get the category that owns the product
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get all categories for this product
     */
    public function categories(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'marketplace_category_product');
    }

    /**
     * Get all product images
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    /**
     * Get all cart items for this product
     */
    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    /**
     * Get all order items for this product
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get all reviews for this product
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }

    /**
     * Get all wishlists containing this product
     */
    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    /**
     * Scope for active products
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for featured products
     */
    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }

    /**
     * Scope for in stock products
     */
    public function scopeInStock($query)
    {
        return $query->where('in_stock', true);
    }

    /**
     * Scope for public visibility
     */
    public function scopePublic($query)
    {
        return $query->where('visibility', 'public');
    }

    /**
     * Scope for search
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'LIKE', "%{$search}%")
                ->orWhere('description', 'LIKE', "%{$search}%")
                ->orWhere('short_description', 'LIKE', "%{$search}%")
                ->orWhere('sku', 'LIKE', "%{$search}%");
        });
    }

    /**
     * Scope for price range
     */
    public function scopePriceRange($query, $min, $max)
    {
        return $query->whereBetween('price', [$min, $max]);
    }

    /**
     * Check if product is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if product is out of stock
     */
    public function isOutOfStock(): bool
    {
        return $this->track_inventory && $this->stock_quantity <= 0;
    }

    /**
     * Check if product is low in stock
     */
    public function isLowInStock(): bool
    {
        return $this->track_inventory && $this->stock_quantity <= $this->minimum_stock;
    }

    /**
     * Get main product image
     */
    public function getMainImageAttribute(): ?string
    {
        $firstImage = $this->images()->where('is_primary', true)->first()
            ?? $this->images()->orderBy('sort_order')->first();
        return $firstImage ? $firstImage->image_path : null;
    }

    /**
     * Get discount percentage
     */
    public function getDiscountPercentageAttribute(): float
    {
        if (!$this->compare_price || $this->compare_price <= $this->price) {
            return 0;
        }

        return round((($this->compare_price - $this->price) / $this->compare_price) * 100, 2);
    }

    /**
     * Get formatted price
     */
    public function getFormattedPriceAttribute(): string
    {
        return $this->currency . ' ' . number_format($this->price, 2);
    }

    /**
     * Get product URL
     */
    public function getUrlAttribute(): string
    {
        return route('marketplace.products.show', $this->slug);
    }

    /**
     * Calculate average rating
     */
    public function calculateAverageRating(): float
    {
        return $this->reviews()->avg('rating') ?? 0;
    }

    /**
     * Get rating attribute - always return a number
     */
    public function getRatingAttribute($value): float
    {
        return $value ? (float) $value : 0.0;
    }

    /**
     * Update rating and review stats
     */
    public function updateRatingStats(): void
    {
        $this->rating = $this->calculateAverageRating();
        $this->total_reviews = $this->reviews()->count();
        $this->save();
    }

    /**
     * Decrease stock quantity
     */
    public function decreaseStock(int $quantity): bool
    {
        if (!$this->track_inventory) {
            return true;
        }

        if ($this->stock_quantity < $quantity) {
            return false;
        }

        $this->stock_quantity -= $quantity;
        $this->save();

        return true;
    }

    /**
     * Increase stock quantity
     */
    public function increaseStock(int $quantity): void
    {
        if (!$this->track_inventory) {
            return;
        }

        $this->stock_quantity += $quantity;
        $this->save();
    }

    /**
     * Increment view count
     */
    public function incrementViewCount(): void
    {
        $this->increment('view_count');
    }
}
