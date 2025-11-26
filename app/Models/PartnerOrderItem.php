<?php

namespace App\Models;

use App\Modules\Marketplace\Models\Product;
use App\Modules\Marketplace\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PartnerOrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'partner_order_id',
        'product_id',
        'vendor_id',
        'product_name',
        'description',
        'quantity',
        'unit',
        'unit_price',
        'total_price',
        'vendor_payout',
        'vendor_paid',
        'vendor_paid_at',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'vendor_payout' => 'decimal:2',
        'vendor_paid' => 'boolean',
        'vendor_paid_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(PartnerOrder::class, 'partner_order_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(PartnerOrderItemAllocation::class);
    }
}
