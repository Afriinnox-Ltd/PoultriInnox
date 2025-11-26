<?php

namespace App\Modules\Marketplace\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $table = 'marketplace_payments';

    protected $fillable = [
        'order_id',
        'subscription_id',
        'transaction_id',
        'payment_method',
        'gateway',
        'type',
        'status',
        'amount',
        'currency',
        'fees',
        'net_amount',
        'gateway_response',
        'gateway_reference',
        'notes',
        'failure_reason',
        'vendor_amount',
        'commission_amount',
        'vendor_paid',
        'vendor_paid_at',
        'payout_requested',
        'payout_requested_at',
        'payout_requested_by',
        'payout_processing',
        'payout_processing_at',
        'payout_processing_by',
        'payout_batch_id',
        'payout_notes',
        'metadata',
        'processed_at',
        'processed_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'fees' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'vendor_amount' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'vendor_paid' => 'boolean',
        'vendor_paid_at' => 'datetime',
        'payout_requested' => 'boolean',
        'payout_requested_at' => 'datetime',
        'payout_processing' => 'boolean',
        'payout_processing_at' => 'datetime',
        'gateway_response' => 'array',
        'metadata' => 'array',
        'processed_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    // Revenue Tracking Methods

    /**
     * Get total revenue for completed payments
     */
    public static function getTotalRevenue(): float
    {
        return static::where('status', 'completed')
            ->where('type', 'payment')
            ->sum('net_amount');
    }

    /**
     * Get total commission earned
     */
    public static function getTotalCommission(): float
    {
        return static::where('status', 'completed')
            ->where('type', 'payment')
            ->sum('commission_amount');
    }

    /**
     * Get total vendor payouts pending
     */
    public static function getPendingVendorPayouts(): float
    {
        return static::where('status', 'completed')
            ->where('type', 'payment')
            ->where('vendor_paid', false)
            ->sum('vendor_amount');
    }

    /**
     * Get total vendor payouts completed
     */
    public static function getCompletedVendorPayouts(): float
    {
        return static::where('status', 'completed')
            ->where('type', 'payment')
            ->where('vendor_paid', true)
            ->sum('vendor_amount');
    }

    /**
     * Get revenue statistics for a specific period
     */
    public static function getRevenueStats(string $period = 'all'): array
    {
        $query = static::where('status', 'completed')->where('type', 'payment');

        // Apply period filter
        switch ($period) {
            case 'today':
                $query->whereDate('processed_at', today());
                break;
            case 'week':
                $query->whereBetween('processed_at', [now()->startOfWeek(), now()->endOfWeek()]);
                break;
            case 'month':
                $query->whereMonth('processed_at', now()->month)
                    ->whereYear('processed_at', now()->year);
                break;
            case 'year':
                $query->whereYear('processed_at', now()->year);
                break;
        }

        return [
            'total_revenue' => $query->sum('net_amount'),
            'total_commission' => $query->sum('commission_amount'),
            'total_vendor_amount' => $query->sum('vendor_amount'),
            'payment_count' => $query->count(),
        ];
    }

    /**
     * Get monthly revenue trend for the current year
     */
    public static function getMonthlyRevenueTrend(): array
    {
        $monthlyData = static::where('status', 'completed')
            ->where('type', 'payment')
            ->whereYear('processed_at', now()->year)
            ->selectRaw('DATE_FORMAT(processed_at, "%m") as month, SUM(net_amount) as revenue, COUNT(*) as transactions')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $trend = [];
        for ($i = 1; $i <= 12; $i++) {
            $monthKey = str_pad($i, 2, '0', STR_PAD_LEFT);
            $monthData = $monthlyData->firstWhere('month', $monthKey);
            $trend[] = [
                'month' => Carbon::create()->month($i)->format('M'),
                'month_number' => $i,
                'revenue' => $monthData ? (float) $monthData->revenue : 0,
                'transactions' => $monthData ? $monthData->transactions : 0,
            ];
        }

        return $trend;
    }

    /**
     * Get payment method statistics
     */
    public static function getPaymentMethodStats(): array
    {
        return static::where('status', 'completed')
            ->where('type', 'payment')
            ->selectRaw('payment_method, SUM(net_amount) as total_amount, COUNT(*) as transaction_count')
            ->groupBy('payment_method')
            ->orderByDesc('total_amount')
            ->get()
            ->toArray();
    }

    /**
     * Get recent payments with order details
     */
    public static function getRecentPayments(int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return static::with(['order.user', 'order.vendor'])
            ->where('type', 'payment')
            ->orderByDesc('processed_at')
            ->limit($limit)
            ->get();
    }

    // Scopes

    /**
     * Scope for completed payments
     */
    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope for pending vendor payouts
     */
    public function scopePendingVendorPayout(Builder $query): Builder
    {
        return $query->where('status', 'completed')
            ->where('vendor_paid', false);
    }

    /**
     * Scope for payments by vendor
     */
    public function scopeByVendor(Builder $query, int $vendorId): Builder
    {
        return $query->whereHas('order', function ($q) use ($vendorId) {
            $q->where('vendor_id', $vendorId);
        });
    }

    /**
     * Mark vendor payout as completed
     */
    public function markVendorPaid(): void
    {
        $this->update([
            'vendor_paid' => true,
            'vendor_paid_at' => now(),
        ]);
    }

    /**
     * Get formatted amount
     */
    public function getFormattedAmountAttribute(): string
    {
        return $this->currency.' '.number_format($this->amount, 2);
    }

    /**
     * Get formatted net amount
     */
    public function getFormattedNetAmountAttribute(): string
    {
        return $this->currency.' '.number_format($this->net_amount, 2);
    }
}
