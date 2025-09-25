import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Star,
    ThumbsUp,
    Edit,
    Trash2,
    ShieldCheck,
    User
} from 'lucide-react';
import { ProductReview } from '@/types/marketplace';

interface ReviewProps {
    review: ProductReview & {
        user: {
            id: number;
            name: string;
        };
    };
    currentUser?: {
        id: number;
        name: string;
    } | null;
    onEdit?: (review: ProductReview) => void;
    onDelete?: (review: ProductReview) => void;
    onHelpful?: (review: ProductReview) => void;
}

export default function Review({
    review,
    currentUser,
    onEdit,
    onDelete,
    onHelpful
}: ReviewProps) {
    const isOwner = currentUser?.id === review.user?.id;

    // Handle case where user data is missing
    if (!review.user) {
        return null;
    }

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${
                    i < rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                }`}
            />
        ));
    };

    return (
        <div className="border-b border-gray-200 pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center h-10 w-10 bg-gray-100 rounded-full">
                        <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">
                                {review.user.name}
                            </span>
                            {review.is_verified_purchase && (
                                <Badge variant="outline" className="text-xs">
                                    <ShieldCheck className="h-3 w-3 mr-1" />
                                    Verified Purchase
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                                {renderStars(review.rating)}
                            </div>
                            <span className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                {isOwner && (
                    <div className="flex items-center space-x-2">
                        {onEdit && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(review)}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                        )}
                        {onDelete && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(review)}
                                className="text-red-600 hover:text-red-800"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {review.title && (
                <h4 className="font-medium text-gray-900 mb-2">
                    {review.title}
                </h4>
            )}

            {review.comment && (
                <p className="text-gray-700 mb-3 leading-relaxed">
                    {review.comment}
                </p>
            )}

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    {onHelpful && currentUser && !isOwner && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onHelpful(review)}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            Helpful ({review.helpful_count || 0})
                        </Button>
                    )}
                    {(!currentUser || isOwner) && review.helpful_count > 0 && (
                        <span className="text-sm text-gray-500">
                            <ThumbsUp className="h-4 w-4 mr-1 inline" />
                            {review.helpful_count} people found this helpful
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
