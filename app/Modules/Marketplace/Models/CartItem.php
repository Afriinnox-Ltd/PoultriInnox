<?php

namespace App\Modules\Marketplace\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class CartItem extends Model
{
    use HasFactory;

    protected $table = 'marketplace_carts';

    protected $fillable = [
        'user_id',
        'session_id',
        'product_id',
        'quantity',
        'unit_price',
        'product_options',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'product_options' => 'array',
    ];

    protected $appends = [
        'total_price'
    ];

    /**
     * Get the user that owns the cart item
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the product
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Calculate total price for this cart item
     */
    public function getTotalPriceAttribute()
    {
        return $this->quantity * $this->unit_price;
    }

    /**
     * Get the total price formatted
     */
    public function getFormattedTotalAttribute()
    {
        return number_format($this->total_price, 2);
    }
}
