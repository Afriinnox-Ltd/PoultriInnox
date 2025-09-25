// Sample usage in a product create/edit form component

import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import UpgradePrompt from '@/components/UpgradePrompt';
import SubscriptionWidget from '@/components/SubscriptionWidget';

interface ProductFormProps {
  needsUpgrade?: boolean;
  upgradeReason?: string;
  subscriptionUsage?: any;
  currentSubscription?: any;
}

export default function ProductFormExample({ 
  needsUpgrade, 
  upgradeReason, 
  subscriptionUsage, 
  currentSubscription 
}: ProductFormProps) {
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Head title="Create Product" />
      
      {/* Upgrade Prompt - Show when user needs to upgrade */}
      {needsUpgrade && (
        <UpgradePrompt 
          reason={upgradeReason as any} 
          currentPlan={currentSubscription?.plan_name} 
        />
      )}

      {/* Subscription Widget - Show current plan status */}
      {subscriptionUsage && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Main product form would go here */}
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent>
                {needsUpgrade ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">
                      Please upgrade your subscription to create more products.
                    </p>
                    <Button disabled>Product Creation Blocked</Button>
                  </div>
                ) : (
                  <div>
                    {/* Normal product form fields would go here */}
                    <p>Product form fields...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div>
            {/* Subscription status sidebar */}
            <SubscriptionWidget subscriptionUsage={subscriptionUsage} />
          </div>
        </div>
      )}
    </div>
  );
}

// Usage examples:

// 1. User with no subscription:
// needsUpgrade = true
// upgradeReason = 'no_subscription'
// subscriptionUsage = null

// 2. User who hit product limit:
// needsUpgrade = true  
// upgradeReason = 'product_limit'
// subscriptionUsage = { plan_name: 'Free', products_used: 5, products_limit: 5, ... }

// 3. User trying to enable COD without premium plan:
// needsUpgrade = true
// upgradeReason = 'cod_required'  
// subscriptionUsage = { plan_name: 'Free', allows_cod: false, ... }

// 4. User approaching limits:
// needsUpgrade = true
// upgradeReason = 'approaching_limits'
// subscriptionUsage = { plan_name: 'Premium', products_used: 45, products_limit: 50, ... }