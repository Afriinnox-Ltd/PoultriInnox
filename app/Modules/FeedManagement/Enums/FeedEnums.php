<?php

namespace App\Modules\FeedManagement\Enums;

class FeedCategory
{
    public const STARTER = 'starter';
    public const GROWER = 'grower';
    public const FINISHER = 'finisher';
    public const LAYER = 'layer';
    public const BROILER = 'broiler';
    public const BREEDER = 'breeder';
    public const SPECIALTY = 'specialty';
    public const SUPPLEMENT = 'supplement';
    public const MEDICATION = 'medication';

    public static function all(): array
    {
        return [
            self::STARTER,
            self::GROWER,
            self::FINISHER,
            self::LAYER,
            self::BROILER,
            self::BREEDER,
            self::SPECIALTY,
            self::SUPPLEMENT,
            self::MEDICATION,
        ];
    }

    public static function getLabels(): array
    {
        return [
            self::STARTER => 'Starter Feed',
            self::GROWER => 'Grower Feed',
            self::FINISHER => 'Finisher Feed',
            self::LAYER => 'Layer Feed',
            self::BROILER => 'Broiler Feed',
            self::BREEDER => 'Breeder Feed',
            self::SPECIALTY => 'Specialty Feed',
            self::SUPPLEMENT => 'Supplement',
            self::MEDICATION => 'Medicated Feed',
        ];
    }

    public static function getAgeRanges(): array
    {
        return [
            self::STARTER => ['min' => 0, 'max' => 21],
            self::GROWER => ['min' => 22, 'max' => 42],
            self::FINISHER => ['min' => 43, 'max' => 70],
            self::LAYER => ['min' => 140, 'max' => 500],
            self::BROILER => ['min' => 0, 'max' => 49],
            self::BREEDER => ['min' => 150, 'max' => 450],
            self::SPECIALTY => ['min' => 0, 'max' => 365],
            self::SUPPLEMENT => ['min' => 0, 'max' => 365],
            self::MEDICATION => ['min' => 0, 'max' => 365],
        ];
    }
}

class InventoryStatus
{
    public const IN_STOCK = 'in_stock';
    public const LOW_STOCK = 'low_stock';
    public const OUT_OF_STOCK = 'out_of_stock';
    public const EXPIRED = 'expired';
    public const CONSUMED = 'consumed';
    public const RESERVED = 'reserved';
    public const QUARANTINED = 'quarantined';
    public const DAMAGED = 'damaged';

    public static function all(): array
    {
        return [
            self::IN_STOCK,
            self::LOW_STOCK,
            self::OUT_OF_STOCK,
            self::EXPIRED,
            self::CONSUMED,
            self::RESERVED,
            self::QUARANTINED,
            self::DAMAGED,
        ];
    }

    public static function getLabels(): array
    {
        return [
            self::IN_STOCK => 'In Stock',
            self::LOW_STOCK => 'Low Stock',
            self::OUT_OF_STOCK => 'Out of Stock',
            self::EXPIRED => 'Expired',
            self::CONSUMED => 'Consumed',
            self::RESERVED => 'Reserved',
            self::QUARANTINED => 'Quarantined',
            self::DAMAGED => 'Damaged',
        ];
    }

    public static function getActiveStatuses(): array
    {
        return [
            self::IN_STOCK,
            self::RESERVED,
        ];
    }

    public static function getAlertStatuses(): array
    {
        return [
            self::LOW_STOCK,
            self::OUT_OF_STOCK,
            self::EXPIRED,
            self::QUARANTINED,
            self::DAMAGED,
        ];
    }
}

class PurchaseOrderStatus
{
    public const PENDING = 'pending';
    public const CONFIRMED = 'confirmed';
    public const SHIPPED = 'shipped';
    public const DELIVERED = 'delivered';
    public const CANCELLED = 'cancelled';
    public const PARTIALLY_DELIVERED = 'partially_delivered';

    public static function all(): array
    {
        return [
            self::PENDING,
            self::CONFIRMED,
            self::SHIPPED,
            self::DELIVERED,
            self::CANCELLED,
            self::PARTIALLY_DELIVERED,
        ];
    }

    public static function getLabels(): array
    {
        return [
            self::PENDING => 'Pending Approval',
            self::CONFIRMED => 'Confirmed',
            self::SHIPPED => 'Shipped',
            self::DELIVERED => 'Delivered',
            self::CANCELLED => 'Cancelled',
            self::PARTIALLY_DELIVERED => 'Partially Delivered',
        ];
    }

    public static function getActiveStatuses(): array
    {
        return [
            self::PENDING,
            self::CONFIRMED,
            self::SHIPPED,
            self::PARTIALLY_DELIVERED,
        ];
    }

    public static function getCompletedStatuses(): array
    {
        return [
            self::DELIVERED,
            self::CANCELLED,
        ];
    }
}

class PaymentStatus
{
    public const PENDING = 'pending';
    public const PAID = 'paid';
    public const OVERDUE = 'overdue';
    public const PARTIAL = 'partial';
    public const CANCELLED = 'cancelled';

    public static function all(): array
    {
        return [
            self::PENDING,
            self::PAID,
            self::OVERDUE,
            self::PARTIAL,
            self::CANCELLED,
        ];
    }

    public static function getLabels(): array
    {
        return [
            self::PENDING => 'Payment Pending',
            self::PAID => 'Paid',
            self::OVERDUE => 'Payment Overdue',
            self::PARTIAL => 'Partially Paid',
            self::CANCELLED => 'Payment Cancelled',
        ];
    }
}

class DeliveryStatus
{
    public const PENDING = 'pending';
    public const IN_TRANSIT = 'in_transit';
    public const COMPLETED = 'completed';
    public const DELAYED = 'delayed';
    public const FAILED = 'failed';

    public static function all(): array
    {
        return [
            self::PENDING,
            self::IN_TRANSIT,
            self::COMPLETED,
            self::DELAYED,
            self::FAILED,
        ];
    }

    public static function getLabels(): array
    {
        return [
            self::PENDING => 'Delivery Pending',
            self::IN_TRANSIT => 'In Transit',
            self::COMPLETED => 'Delivered',
            self::DELAYED => 'Delayed',
            self::FAILED => 'Delivery Failed',
        ];
    }
}

class FeedConsumptionMethod
{
    public const MANUAL = 'manual';
    public const AUTOMATIC_FEEDER = 'automatic_feeder';
    public const TROUGH = 'trough';
    public const SCATTERED = 'scattered';
    public const TUBE_FEEDER = 'tube_feeder';
    public const CHAIN_FEEDER = 'chain_feeder';

    public static function all(): array
    {
        return [
            self::MANUAL,
            self::AUTOMATIC_FEEDER,
            self::TROUGH,
            self::SCATTERED,
            self::TUBE_FEEDER,
            self::CHAIN_FEEDER,
        ];
    }

    public static function getLabels(): array
    {
        return [
            self::MANUAL => 'Manual Feeding',
            self::AUTOMATIC_FEEDER => 'Automatic Feeder',
            self::TROUGH => 'Feeding Trough',
            self::SCATTERED => 'Scattered Feeding',
            self::TUBE_FEEDER => 'Tube Feeder',
            self::CHAIN_FEEDER => 'Chain Feeder',
        ];
    }
}

class QualityGrade
{
    public const A_PLUS = 'A+';
    public const A = 'A';
    public const B_PLUS = 'B+';
    public const B = 'B';
    public const C = 'C';
    public const REJECTED = 'rejected';

    public static function all(): array
    {
        return [
            self::A_PLUS,
            self::A,
            self::B_PLUS,
            self::B,
            self::C,
            self::REJECTED,
        ];
    }

    public static function getLabels(): array
    {
        return [
            self::A_PLUS => 'Premium (A+)',
            self::A => 'Excellent (A)',
            self::B_PLUS => 'Very Good (B+)',
            self::B => 'Good (B)',
            self::C => 'Acceptable (C)',
            self::REJECTED => 'Rejected',
        ];
    }

    public static function getAcceptableGrades(): array
    {
        return [
            self::A_PLUS,
            self::A,
            self::B_PLUS,
            self::B,
            self::C,
        ];
    }
}

class OrderPriority
{
    public const LOW = 'low';
    public const NORMAL = 'normal';
    public const HIGH = 'high';
    public const URGENT = 'urgent';
    public const EMERGENCY = 'emergency';

    public static function all(): array
    {
        return [
            self::LOW,
            self::NORMAL,
            self::HIGH,
            self::URGENT,
            self::EMERGENCY,
        ];
    }

    public static function getLabels(): array
    {
        return [
            self::LOW => 'Low Priority',
            self::NORMAL => 'Normal Priority',
            self::HIGH => 'High Priority',
            self::URGENT => 'Urgent',
            self::EMERGENCY => 'Emergency',
        ];
    }

    public static function getColors(): array
    {
        return [
            self::LOW => 'blue',
            self::NORMAL => 'gray',
            self::HIGH => 'yellow',
            self::URGENT => 'orange',
            self::EMERGENCY => 'red',
        ];
    }
}

class BirdType
{
    public const BROILER = 'broiler';
    public const LAYER = 'layer';
    public const BREEDER = 'breeder';
    public const TURKEY = 'turkey';
    public const DUCK = 'duck';
    public const GOOSE = 'goose';
    public const GUINEA_FOWL = 'guinea_fowl';
    public const QUAIL = 'quail';

    public static function all(): array
    {
        return [
            self::BROILER,
            self::LAYER,
            self::BREEDER,
            self::TURKEY,
            self::DUCK,
            self::GOOSE,
            self::GUINEA_FOWL,
            self::QUAIL,
        ];
    }

    public static function getLabels(): array
    {
        return [
            self::BROILER => 'Broiler Chicken',
            self::LAYER => 'Layer Chicken',
            self::BREEDER => 'Breeder Chicken',
            self::TURKEY => 'Turkey',
            self::DUCK => 'Duck',
            self::GOOSE => 'Goose',
            self::GUINEA_FOWL => 'Guinea Fowl',
            self::QUAIL => 'Quail',
        ];
    }
}
