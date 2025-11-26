<?php

namespace Tests\Feature\Mail;

use App\Mail\Marketplace\NewOrderReceived;
use App\Mail\Marketplace\OrderPlaced;
use App\Models\User;
use App\Modules\Marketplace\Models\Order;
use App\Modules\Marketplace\Models\OrderItem;
use App\Modules\Marketplace\Models\Product;
use App\Modules\Marketplace\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class OrderEmailsTest extends TestCase
{
    use RefreshDatabase;

    protected function createOrderWithItems()
    {
        $customer = User::factory()->create(['name' => 'Customer Name']);
        $vendorUser = User::factory()->create();
        $vendor = Vendor::factory()->create([
            'user_id' => $vendorUser->id,
            'business_name' => 'Test Vendor',
        ]);

        $product = Product::factory()->create([
            'vendor_id' => $vendor->id,
            'name' => 'Poultry Feeder',
            'sku' => 'PF-001',
            'unit_of_measure' => 'piece',
            'price' => 5000,
        ]);

        $order = Order::factory()->create([
            'user_id' => $customer->id,
            'vendor_id' => $vendor->id,
            'order_number' => 'ORD-2024-001',
            'subtotal' => 10000,
            'tax_amount' => 1800,
            'shipping_cost' => 2000,
            'total_amount' => 13800,
            'status' => 'pending',
            'shipping_address' => '123 Kigali Street',
            'shipping_city' => 'Kigali',
            'shipping_state' => 'Kigali',
            'shipping_phone' => '+250788123456',
        ]);

        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'quantity' => 2,
            'price' => 5000,
        ]);

        // Load relationships
        $order->load(['user', 'vendor', 'items.product']);

        return $order;
    }

    /** @test */
    public function order_placed_email_can_be_rendered()
    {
        $order = $this->createOrderWithItems();

        $mailable = new OrderPlaced($order);

        $mailable->assertSeeInHtml('Order Confirmation');
        $mailable->assertSeeInHtml($order->order_number);
        $mailable->assertSeeInHtml($order->user->name);
        $mailable->assertSeeInHtml('Track Your Order');
    }

    /** @test */
    public function order_placed_displays_order_items()
    {
        $order = $this->createOrderWithItems();

        $mailable = new OrderPlaced($order);

        $item = $order->items->first();
        $mailable->assertSeeInHtml($item->product_name);
        $mailable->assertSeeInHtml((string) $item->quantity);
        $mailable->assertSeeInHtml(number_format($item->price, 0));
    }

    /** @test */
    public function order_placed_displays_totals()
    {
        $order = $this->createOrderWithItems();

        $mailable = new OrderPlaced($order);

        $mailable->assertSeeInHtml(number_format($order->subtotal, 0));
        $mailable->assertSeeInHtml(number_format($order->total_amount, 0));
    }

    /** @test */
    public function order_placed_displays_shipping_address()
    {
        $order = $this->createOrderWithItems();

        $mailable = new OrderPlaced($order);

        $mailable->assertSeeInHtml($order->shipping_address);
        $mailable->assertSeeInHtml($order->shipping_city);
        $mailable->assertSeeInHtml($order->shipping_phone);
    }

    /** @test */
    public function order_placed_has_correct_subject()
    {
        $order = $this->createOrderWithItems();

        $mailable = new OrderPlaced($order);

        $this->assertEquals('Order Confirmation #' . $order->order_number, $mailable->envelope()->subject);
    }

    /** @test */
    public function new_order_received_email_can_be_rendered()
    {
        $order = $this->createOrderWithItems();

        $mailable = new NewOrderReceived($order);

        $mailable->assertSeeInHtml('New Order Received');
        $mailable->assertSeeInHtml($order->order_number);
        $mailable->assertSeeInHtml($order->vendor->business_name);
        $mailable->assertSeeInHtml($order->user->name);
    }

    /** @test */
    public function new_order_received_displays_product_details()
    {
        $order = $this->createOrderWithItems();

        $mailable = new NewOrderReceived($order);

        $item = $order->items->first();
        $mailable->assertSeeInHtml($item->product_name);
        
        // Check for SKU if product is loaded
        if ($item->product) {
            $mailable->assertSeeInHtml($item->product->sku);
        }
    }

    /** @test */
    public function new_order_received_has_correct_subject()
    {
        $order = $this->createOrderWithItems();

        $mailable = new NewOrderReceived($order);

        $this->assertStringContainsString('New Order Received', $mailable->envelope()->subject);
        $this->assertStringContainsString($order->order_number, $mailable->envelope()->subject);
    }

    /** @test */
    public function order_emails_can_be_sent()
    {
        Mail::fake();

        $order = $this->createOrderWithItems();

        // Send customer order confirmation
        Mail::to($order->user->email)->send(new OrderPlaced($order));
        Mail::assertSent(OrderPlaced::class, function ($mail) use ($order) {
            return $mail->order->id === $order->id;
        });

        // Send vendor new order notification
        Mail::to($order->vendor->business_email)->send(new NewOrderReceived($order));
        Mail::assertSent(NewOrderReceived::class, function ($mail) use ($order) {
            return $mail->order->id === $order->id;
        });
    }

    /** @test */
    public function order_emails_handle_missing_product_relationship_gracefully()
    {
        $order = $this->createOrderWithItems();
        
        // Unload the product relationship to test optional() helper
        $order->unsetRelation('items');
        $order->load('items'); // Load items without products

        $customerMailable = new OrderPlaced($order);
        $vendorMailable = new NewOrderReceived($order);

        // Should not throw errors even without product relationship
        $customerMailable->assertSeeInHtml('units'); // Fallback value
        $vendorMailable->assertSeeInHtml('N/A'); // Fallback for SKU
    }
}
