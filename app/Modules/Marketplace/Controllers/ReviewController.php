<?php

namespace App\Modules\Marketplace\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Marketplace\Models\Product;
use App\Modules\Marketplace\Models\ProductReview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ReviewController extends Controller
{
    /**
     * Store a newly created review.
     */
    public function store(Request $request, Product $product)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'nullable|string|max:1000',
        ]);

        // Check if user already reviewed this product
        $existingReview = ProductReview::where('product_id', $product->id)
            ->where('user_id', Auth::id())
            ->first();

        if ($existingReview) {
            return back()->withErrors(['review' => 'You have already reviewed this product.']);
        }

        // Check if user has purchased this product (optional verification)
        $hasPurchased = false; // TODO: Implement purchase verification logic

        $review = ProductReview::create([
            'product_id' => $product->id,
            'user_id' => Auth::id(),
            'rating' => $request->rating,
            'title' => $request->title,
            'comment' => $request->comment,
            'is_verified_purchase' => $hasPurchased,
            'is_approved' => true, // Auto-approve for now
        ]);

        // Update product rating and review count
        $this->updateProductRating($product);

        return back()->with('success', 'Your review has been posted successfully!');
    }

    /**
     * Update the specified review.
     */
    public function update(Request $request, Product $product, ProductReview $review)
    {
        // Check if user owns the review
        if ($review->user_id != Auth::id()) {
            abort(403, 'Unauthorized to edit this review');
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review->update([
            'rating' => $request->rating,
            'title' => $request->title,
            'comment' => $request->comment,
        ]);

        // Update product rating and review count
        $this->updateProductRating($product);

        return back()->with('success', 'Your review has been updated successfully!');
    }

    /**
     * Remove the specified review.
     */
    public function destroy(Product $product, ProductReview $review)
    {
        // Check if user owns the review
        if ($review->user_id != Auth::id()) {
            abort(403, 'Unauthorized to delete this review');
        }

        $review->delete();

        // Update product rating and review count
        $this->updateProductRating($product);

        return back()->with('success', 'Your review has been deleted successfully!');
    }

    /**
     * Toggle helpful count for a review.
     */
    public function toggleHelpful(Product $product, ProductReview $review)
    {
        // For now, just increment the helpful count
        // In a full implementation, you'd track which users found it helpful
        $review->increment('helpful_count');

        return back()->with('success', 'Thank you for your feedback!');
    }

    /**
     * Update product rating and review statistics.
     */
    private function updateProductRating(Product $product)
    {
        $reviews = $product->reviews()->where('is_approved', true);

        $product->update([
            'rating' => $reviews->avg('rating') ?? 0,
            'total_reviews' => $reviews->count(),
        ]);

        // Also update vendor rating if needed
        $vendor = $product->vendor;
        if ($vendor) {
            $allProductReviews = ProductReview::whereHas('product', function ($query) use ($vendor) {
                $query->where('vendor_id', $vendor->id);
            })->where('is_approved', true);

            $vendor->update([
                'rating' => $allProductReviews->avg('rating') ?? 0,
                'total_reviews' => $allProductReviews->count(),
            ]);
        }
    }
}
