import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Crown, ArrowRight, X } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useState } from 'react';

interface UpgradeBannerProps {
  reason?: 'product_limit' | 'order_limit' | 'cod_required' | 'general';
  currentPlan?: string;
  onDismiss?: () => void;
  compact?: boolean;
}

export default function UpgradeBanner({ 
  reason = 'general', 
  currentPlan = 'Free',
  onDismiss,
  compact = false 
}: UpgradeBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (dismissed) return null;

  const messages = {
    product_limit: {
      title: 'Product Limit Reached',
      description: `You've reached the maximum products allowed on your ${currentPlan} plan. Upgrade to add more products.`,
      cta: 'Upgrade for More Products'
    },
    order_limit: {
      title: 'Order Limit Nearly Reached',
      description: `You're approaching your monthly order limit on the ${currentPlan} plan. Upgrade for unlimited orders.`,
      cta: 'Upgrade for Unlimited Orders'
    },
    cod_required: {
      title: 'Cash on Delivery Unavailable',
      description: `Enable Cash on Delivery payments by upgrading from your ${currentPlan} plan to Premium or Enterprise.`,
      cta: 'Enable COD Payments'
    },
    general: {
      title: 'Unlock Premium Features',
      description: `Get more from your marketplace with Premium features like unlimited products, COD payments, and priority support.`,
      cta: 'Explore Premium Plans'
    }
  };

  const message = messages[reason];

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Crown className="w-4 h-4" />
          <span className="text-sm font-medium">{message.title}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/marketplace/subscriptions/upgrade">
            <Button size="sm" variant="secondary" className="text-xs">
              Upgrade
            </Button>
          </Link>
          {onDismiss && (
            <button onClick={handleDismiss} className="text-white/80 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Alert className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <Crown className="h-4 w-4 text-purple-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="space-y-2">
          <h4 className="font-semibold text-purple-900">{message.title}</h4>
          <p className="text-purple-700">{message.description}</p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <Link href="/marketplace/subscriptions/upgrade">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              {message.cta}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={handleDismiss}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}