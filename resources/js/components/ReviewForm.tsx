import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, X } from 'lucide-react';
import { ProductReview } from '@/types/marketplace';
import { router } from '@inertiajs/react';

interface ReviewFormProps {
    productId: number;
    productSlug: string;
    review?: ProductReview; // For editing
    onCancel?: () => void;
    onSubmit?: () => void;
}

export default function ReviewForm({
    productId,
    productSlug,
    review,
    onCancel,
    onSubmit
}: ReviewFormProps) {
    const [rating, setRating] = useState(review?.rating || 0);
    const [hoverRating, setHoverRating] = useState(0);
    const [title, setTitle] = useState(review?.title || '');
    const [comment, setComment] = useState(review?.comment || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditing = !!review;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            return;
        }

        setIsSubmitting(true);

        const data = {
            rating,
            title: title.trim(),
            comment: comment.trim(),
        };

        if (isEditing) {
            // Update existing review
            router.put(
                `/marketplace/products/${productSlug}/reviews/${review.id}`,
                data,
                {
                    onSuccess: () => {
                        setIsSubmitting(false);
                        onSubmit?.();
                    },
                    onError: () => {
                        setIsSubmitting(false);
                    }
                }
            );
        } else {
            // Create new review
            router.post(
                `/marketplace/products/${productSlug}/reviews`,
                data,
                {
                    onSuccess: () => {
                        setIsSubmitting(false);
                        setRating(0);
                        setTitle('');
                        setComment('');
                        onSubmit?.();
                    },
                    onError: () => {
                        setIsSubmitting(false);
                    }
                }
            );
        }
    };

    const renderStars = () => {
        return Array.from({ length: 5 }, (_, i) => {
            const starValue = i + 1;
            const isFilled = starValue <= (hoverRating || rating);

            return (
                <Star
                    key={i}
                    className={`h-8 w-8 cursor-pointer transition-colors ${
                        isFilled
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300 hover:text-yellow-200'
                    }`}
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(0)}
                />
            );
        });
    };

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">
                    {isEditing ? 'Edit Your Review' : 'Write a Review'}
                </CardTitle>
                {onCancel && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onCancel}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Rating */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">
                            Rating *
                        </Label>
                        <div className="flex items-center space-x-1">
                            {renderStars()}
                            <span className="ml-2 text-sm text-gray-600">
                                {rating > 0 ? `${rating} out of 5 stars` : 'Select a rating'}
                            </span>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="review-title" className="text-sm font-medium">
                            Review Title (Optional)
                        </Label>
                        <Input
                            id="review-title"
                            type="text"
                            placeholder="Summarize your experience in a few words..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={255}
                        />
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                        <Label htmlFor="review-comment" className="text-sm font-medium">
                            Your Review (Optional)
                        </Label>
                        <Textarea
                            id="review-comment"
                            placeholder="Share your thoughts about this product..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            maxLength={1000}
                        />
                        <p className="text-xs text-gray-500">
                            {comment.length}/1000 characters
                        </p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center justify-end space-x-3">
                        {onCancel && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            type="submit"
                            disabled={rating === 0 || isSubmitting}
                        >
                            {isSubmitting
                                ? (isEditing ? 'Updating...' : 'Posting...')
                                : (isEditing ? 'Update Review' : 'Post Review')
                            }
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
