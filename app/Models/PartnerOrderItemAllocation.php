<?php

namespace App\Models;

use App\Modules\Marketplace\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PartnerOrderItemAllocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'partner_order_item_id',
        'vendor_id',
        'product_id',
        'quantity',
        'unit_price',
        'vendor_payout',
        'vendor_paid',
        'vendor_paid_at',
        'notes',
    ];

    protected $casts = [
        'quantity'      => 'decimal:2',
        'unit_price'    => 'decimal:2',
        'vendor_payout' => 'decimal:2',
        'vendor_paid'   => 'boolean',
        'vendor_paid_at'=> 'datetime',
    ];

    public function item(): BelongsTo
    {
        return $this->belongsTo(PartnerOrderItem::class, 'partner_order_item_id');
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }
}
