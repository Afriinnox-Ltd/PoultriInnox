import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Crown, ArrowRight } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface UpgradePromptProps {
  reason: 'no_subscription' | 'product_limit' | 'cod_required' | 'approaching_limits';
  currentPlan?: string;
  className?: string;
}

export default function UpgradePrompt({ reason, currentPlan = 'Free', className = '' }: UpgradePromptProps) {
  const getPromptConfig = () => {
    switch (reason) {
      case 'no_subscription':
        return {
          title: 'Subscription Required',
          message: 'You need an active subscription plan to create products and access marketplace features.',
          buttonText: 'Choose a Plan',
          variant: 'destructive' as const,
        };
      case 'product_limit':
        return {
          title: 'Product Limit Reached',
          message: `You've reached the product limit for your ${currentPlan} plan. Upgrade to add more products.`,
          buttonText: 'Upgrade Plan',
          variant: 'destructive' as const,
        };
      case 'cod_required':
        return {
          title: 'COD Unavailable',
          message: 'Cash on Delivery is only available with Premium and Enterprise plans.',
          buttonText: 'Upgrade for COD',
          variant: 'default' as const,
        };
      case 'approaching_limits':
        return {
          title: 'Approaching Plan Limits',
          message: `You're close to reaching your ${currentPlan} plan limits. Consider upgrading for more capacity.`,
          buttonText: 'Upgrade Plan',
          variant: 'default' as const,
        };
      default:
        return {
          title: 'Upgrade Available',
          message: 'Unlock more features with a premium subscription plan.',
          buttonText: 'Learn More',
          variant: 'default' as const,
        };
    }
  };

  const config = getPromptConfig();

  return (
    <Alert className={`border-yellow-200 bg-yellow-50 ${className}`}>
      <Crown className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-yellow-900 mb-1">{config.title}</h4>
          <p className="text-yellow-700 text-sm">{config.message}</p>
        </div>
        <Link href="/marketplace/subscriptions/upgrade" className="ml-4">
          <Button 
            size="sm" 
            variant={config.variant}
            className="whitespace-nowrap"
          >
            {config.buttonText}
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
}