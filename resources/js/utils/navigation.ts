import { router } from '@inertiajs/react';

/**
 * Cross-module navigation utilities for easy linking between related data
 * This provides consistent navigation patterns across the entire application
 */

// Navigation helpers for different modules
export const navigation = {
  // Batch Incubator Module
  batch: {
    view: (batchId: number) => router.visit(`/batch-incubator/batches/${batchId}`),
    list: () => router.visit('/batch-incubator/batches'),
    create: () => router.visit('/batch-incubator/batches/create'),
    edit: (batchId: number) => router.visit(`/batch-incubator/batches/${batchId}/edit`),
  },

  incubator: {
    view: (incubatorId: number) => router.visit(`/batch-incubator/incubators/${incubatorId}`),
    list: () => router.visit('/batch-incubator/incubators'),
    create: () => router.visit('/batch-incubator/incubators/create'),
    edit: (incubatorId: number) => router.visit(`/batch-incubator/incubators/${incubatorId}/edit`),
  },

  schedule: {
    view: (scheduleId: number) => router.visit(`/batch-incubator/schedules/${scheduleId}`),
    list: () => router.visit('/batch-incubator/schedules'),
    create: () => router.visit('/batch-incubator/schedules/create'),
    edit: (scheduleId: number) => router.visit(`/batch-incubator/schedules/${scheduleId}/edit`),
  },

  // Feed Management Module
  feedType: {
    view: (typeId: number) => router.visit(`/feed-management/types/${typeId}`),
    list: () => router.visit('/feed-management/types'),
    create: () => router.visit('/feed-management/types/create'),
    edit: (typeId: number) => router.visit(`/feed-management/types/${typeId}/edit`),
  },

  feedInventory: {
    view: (inventoryId: string) => router.visit(`/feed-management/inventory/?batch_number=${inventoryId}`),
    list: () => router.visit('/feed-management/inventory'),
    create: () => router.visit('/feed-management/inventory/create'),
    edit: (inventoryId: string) => router.visit(`/feed-management/inventory/?id=${inventoryId}`),
  },

  feedConsumption: {
    view: (consumptionId: number) => router.visit(`/feed-management/consumption/${consumptionId}`),
    list: () => router.visit('/feed-management/consumption'),
    create: () => router.visit('/feed-management/consumption/create'),
    edit: (consumptionId: number) => router.visit(`/feed-management/consumption/${consumptionId}/edit`),
  },

  feedSupplier: {
    view: (supplierId: number) => router.visit(`/feed-management/suppliers/${supplierId}`),
    list: () => router.visit('/feed-management/suppliers'),
    create: () => router.visit('/feed-management/suppliers/create'),
    edit: (supplierId: number) => router.visit(`/feed-management/suppliers/${supplierId}/edit`),
  },

  // Marketplace Module
  marketplace: {
    index: () => router.visit('/marketplace'),
    product: {
      view: (slug: string) => router.visit(`/marketplace/products/${slug}`),
      list: () => router.visit('/marketplace'),
      search: (query: string) => router.visit(`/marketplace?search=${encodeURIComponent(query)}`),
      category: (categorySlug: string) => router.visit(`/marketplace?category=${categorySlug}`),
    },
    cart: {
      view: () => router.visit('/marketplace/cart'),
      checkout: () => router.visit('/marketplace/checkout'),
    },
    orders: {
      list: () => router.visit('/marketplace/orders'),
      view: (orderId: number) => router.visit(`/marketplace/orders/${orderId}`),
    },
    vendor: {
      register: () => router.visit('/marketplace/vendor/register'),
      dashboard: () => router.visit('/marketplace/vendor/dashboard'),
      products: () => router.visit('/marketplace/vendor/products'),
      orders: () => router.visit('/marketplace/vendor/orders'),
      profile: () => router.visit('/marketplace/vendor/profile'),
    },
    wishlist: () => router.visit('/marketplace/wishlist'),
  },

  // Reports Module
  reports: {
    view: (reportId: number) => router.visit(`/reports/${reportId}`),
    list: () => router.visit('/reports'),
    create: () => router.visit('/reports/create'),
    batchReport: (batchId: number) => router.visit(`/reports/batch/${batchId}`),
    feedReport: () => router.visit('/reports/feed'),
    performanceReport: () => router.visit('/reports/performance'),
  },

  // Dashboard and main areas
  dashboard: () => router.visit('/dashboard'),
  modules: () => router.visit('/modules'),
  settings: () => router.visit('/settings'),

  // User management
  users: {
    list: () => router.visit('/users'),
    view: (userId: number) => router.visit(`/users/${userId}`),
    edit: (userId: number) => router.visit(`/users/${userId}/edit`),
  }
};

// Quick navigation links for different module contexts
export const getQuickNavigation = (currentModule: string) => {
  const baseLinks = [
    { label: 'Dashboard', action: navigation.dashboard, icon: 'Home' },
    { label: 'All Modules', action: navigation.modules, icon: 'Grid' },
  ];

  switch (currentModule) {
    case 'feed-management':
      return [
        ...baseLinks,
        { label: 'Feed Types', action: navigation.feedType.list, icon: 'Package' },
        { label: 'Feed Inventory', action: navigation.feedInventory.list, icon: 'Warehouse' },
        { label: 'Feed Consumption', action: navigation.feedConsumption.list, icon: 'Utensils' },
        { label: 'Feed Suppliers', action: navigation.feedSupplier.list, icon: 'Truck' },
        { label: 'View Batches', action: navigation.batch.list, icon: 'Layers' },
      ];

    case 'batch-incubator':
      return [
        ...baseLinks,
        { label: 'Batches', action: navigation.batch.list, icon: 'Layers' },
        { label: 'Incubators', action: navigation.incubator.list, icon: 'ThermometerSun' },
        { label: 'Schedules', action: navigation.schedule.list, icon: 'Calendar' },
        { label: 'Feed Management', action: navigation.feedConsumption.list, icon: 'Utensils' },
      ];

    case 'reports':
      return [
        ...baseLinks,
        { label: 'All Reports', action: navigation.reports.list, icon: 'FileText' },
        { label: 'Batch Reports', action: () => navigation.reports.batchReport, icon: 'BarChart' },
        { label: 'Feed Reports', action: navigation.reports.feedReport, icon: 'PieChart' },
        { label: 'View Batches', action: navigation.batch.list, icon: 'Layers' },
      ];

    case 'marketplace':
      return [
        ...baseLinks,
        { label: 'Browse Products', action: navigation.marketplace.index, icon: 'Store' },
        { label: 'Shopping Cart', action: navigation.marketplace.cart.view, icon: 'ShoppingCart' },
        { label: 'My Orders', action: navigation.marketplace.orders.list, icon: 'Package' },
        { label: 'Vendor Dashboard', action: navigation.marketplace.vendor.dashboard, icon: 'BarChart' },
        { label: 'Wishlist', action: navigation.marketplace.wishlist, icon: 'Heart' },
      ];

    default:
      return baseLinks;
  }
};

// Utility to create clickable link components
export const createNavigationLink = (
  text: string,
  action: () => void,
  className?: string,
  showIcon: boolean = true
) => {
  return {
    text,
    action,
    className: className || "text-emerald-600 hover:text-emerald-800 hover:underline cursor-pointer flex items-center gap-1",
    showIcon
  };
};

// Common navigation patterns
export const NavigationPatterns = {
  // For displaying related entities with links
  batchLink: (batchId: number, batchCode: string) =>
    createNavigationLink(batchCode, () => navigation.batch.view(batchId), "font-medium text-emerald-600 hover:text-emerald-800 hover:underline cursor-pointer flex items-center gap-1"),

  feedTypeLink: (typeId: number, typeName: string) =>
    createNavigationLink(typeName, () => navigation.feedType.view(typeId), "font-medium text-emerald-600 hover:text-emerald-800 hover:underline cursor-pointer flex items-center gap-1"),

  inventoryLink: (inventoryId: string, batchNumber: string) =>
    createNavigationLink(`Batch: ${batchNumber}`, () => navigation.feedInventory.view(inventoryId), "text-xs text-purple-600 hover:text-purple-800 hover:underline cursor-pointer flex items-center gap-1"),

  scheduleLink: (scheduleId: number, scheduleTitle: string) =>
    createNavigationLink(scheduleTitle, () => navigation.schedule.view(scheduleId), "text-sm text-orange-600 hover:text-orange-800 hover:underline cursor-pointer flex items-center gap-1"),

  incubatorLink: (incubatorId: number, incubatorName: string) =>
    createNavigationLink(incubatorName, () => navigation.incubator.view(incubatorId), "text-sm text-red-600 hover:text-red-800 hover:underline cursor-pointer flex items-center gap-1"),

  // Marketplace patterns
  productLink: (slug: string, productName: string) =>
    createNavigationLink(productName, () => navigation.marketplace.product.view(slug), "font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex items-center gap-1"),

  vendorLink: (vendorId: number, vendorName: string) =>
    createNavigationLink(vendorName, () => router.visit(`/marketplace/vendors/${vendorId}`), "text-sm text-emerald-600 hover:text-emerald-800 hover:underline cursor-pointer flex items-center gap-1"),

  orderLink: (orderId: number, orderNumber: string) =>
    createNavigationLink(`Order #${orderNumber}`, () => navigation.marketplace.orders.view(orderId), "text-sm text-purple-600 hover:text-purple-800 hover:underline cursor-pointer flex items-center gap-1"),
};

// Simple navigation functions for backward compatibility
export const navigateToBatch = (batchId: number) => navigation.batch.view(batchId);
export const navigateToFeedType = (feedTypeId: number) => navigation.feedType.view(feedTypeId);
export const navigateToInventory = (inventoryId: string) => navigation.feedInventory.view(inventoryId);
export const navigateToSchedule = (scheduleId: number) => navigation.schedule.view(scheduleId);
export const navigateToFeedManagement = () => router.visit('/feed-management');
export const navigateToBatchIncubator = () => router.visit('/batch-incubator');
export const navigateToFeedConsumption = (batchId?: number, inventoryId?: number) => {
  let url = '/feed-management/consumption';
  const params = new URLSearchParams();

  if (batchId) params.append('batch_id', batchId.toString());
  if (inventoryId) params.append('inventory_id', inventoryId.toString());

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  router.visit(url);
};

// Navigation helper class for complex operations
export class NavigationHelper {
  static toBatchOperations(batchId: number) {
    return {
      viewBatch: () => navigateToBatch(batchId),
      viewFeedConsumption: () => navigateToFeedConsumption(batchId),
      viewSchedules: () => router.visit(`/batch-incubator/schedules?batch_id=${batchId}`),
      viewReports: () => router.visit(`/reports/batch/${batchId}`)
    };
  }

  static toFeedOperations(feedTypeId?: number, inventoryId?: string) {
    return {
      viewFeedTypes: () => navigation.feedType.list(),
      viewInventory: () => navigation.feedInventory.list(),
      viewConsumption: () => navigation.feedConsumption.list(),
      viewSpecificFeedType: feedTypeId ? () => navigateToFeedType(feedTypeId) : undefined,
      viewSpecificInventory: inventoryId ? () => navigateToInventory(inventoryId) : undefined
    };
  }

  // Quick marketplace navigation
  static toMarketplace() {
    return {
      browse: () => navigation.marketplace.index(),
      products: () => navigation.marketplace.product.list(),
      cart: () => navigation.marketplace.cart.view(),
      orders: () => navigation.marketplace.orders.list(),
      vendorDashboard: () => navigation.marketplace.vendor.dashboard(),
      vendorRegistration: () => navigation.marketplace.vendor.register(),
      wishlist: () => navigation.marketplace.wishlist(),
    };
  }
}
