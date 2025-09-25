import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, MessageSquare, Plus } from 'lucide-react';
import { ProductReview } from '@/types/marketplace';
import { router } from '@inertiajs/react';
import Review from '@/components/Review';
import ReviewForm from '@/components/ReviewForm';

interface ReviewsListProps {
    productId: number;
    productSlug: string;
    reviews: (ProductReview & { user: { id: number; name: string } })[];
    currentUser?: {
        id: number;
        name: string;
    } | null;
    averageRating: number;
    totalReviews: number;
}

export default function ReviewsList({
    productId,
    productSlug,
    reviews,
    currentUser,
    averageRating,
    totalReviews
}: ReviewsListProps) {
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [editingReview, setEditingReview] = useState<ProductReview | null>(null);

    // Check if current user has already reviewed this product
    const userReview = reviews.find(review =>
        currentUser && review.user_id === currentUser.id
    );

    const handleEditReview = (review: ProductReview) => {
        setEditingReview(review);
        setShowReviewForm(true);
    };

    const handleDeleteReview = (review: ProductReview) => {
        if (confirm('Are you sure you want to delete your review? This action cannot be undone.')) {
            router.delete(`/marketplace/products/${productSlug}/reviews/${review.id}`);
        }
    };

    const handleHelpfulReview = (review: ProductReview) => {
        router.post(`/marketplace/products/${productSlug}/reviews/${review.id}/helpful`);
    };

    const handleFormSubmit = () => {
        setShowReviewForm(false);
        setEditingReview(null);
    };

    const handleFormCancel = () => {
        setShowReviewForm(false);
        setEditingReview(null);
    };

    const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
        const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
        const numRating = Number(rating) || 0; // Ensure it's a number

        return (
            <div className="flex items-center">
                {Array.from({ length: 5 }, (_, i) => (
                    <Star
                        key={i}
                        className={`${starSize} ${
                            i < Math.floor(numRating)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                        }`}
                    />
                ))}
                <span className={`ml-2 font-medium ${size === 'md' ? 'text-lg' : 'text-sm'}`}>
                    {numRating.toFixed(1)}
                </span>
            </div>
        );
    };

    const getRatingBreakdown = () => {
        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(review => {
            breakdown[review.rating as keyof typeof breakdown]++;
        });
        return breakdown;
    };

    const ratingBreakdown = getRatingBreakdown();

    return (
        <div className="space-y-6">
            {/* Reviews Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <MessageSquare className="h-5 w-5" />
                        <span>Customer Reviews</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Overall Rating */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            {renderStars(averageRating, 'md')}
                            <span className="text-sm text-gray-600">
                                Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {/* Write Review Button */}
                        {currentUser && !userReview && !showReviewForm && (
                            <Button onClick={() => setShowReviewForm(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Write Review
                            </Button>
                        )}
                    </div>

                    {/* Rating Breakdown */}
                    {totalReviews > 0 && (
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map(star => {
                                const count = ratingBreakdown[star as keyof typeof ratingBreakdown];
                                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                                return (
                                    <div key={star} className="flex items-center space-x-3">
                                        <span className="text-sm font-medium w-8">
                                            {star} ★
                                        </span>
                                        <div className="flex-1 h-2 bg-gray-200 rounded-full">
                                            <div
                                                className="h-2 bg-yellow-400 rounded-full transition-all duration-300"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-600 w-12">
                                            {count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Auth Required Message */}
                    {!currentUser && (
                        <div className="text-center py-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-600 mb-2">
                                Please sign in to write a review
                            </p>
                            <Button asChild variant="outline">
                                <a href="/login">Sign In</a>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Review Form */}
            {showReviewForm && currentUser && (
                <ReviewForm
                    productId={productId}
                    productSlug={productSlug}
                    review={editingReview || undefined}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                />
            )}

            {/* Reviews List */}
            {reviews.length > 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Reviews ({totalReviews})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {reviews.map((review, index) => (
                                <div key={review.id}>
                                    <Review
                                        review={review}
                                        currentUser={currentUser}
                                        onEdit={handleEditReview}
                                        onDelete={handleDeleteReview}
                                        onHelpful={handleHelpfulReview}
                                    />
                                    {index < reviews.length - 1 && (
                                        <Separator className="mt-6" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="py-12 text-center">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No reviews yet
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Be the first to share your thoughts about this product.
                        </p>
                        {currentUser && !showReviewForm && (
                            <Button onClick={() => setShowReviewForm(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Write the first review
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
