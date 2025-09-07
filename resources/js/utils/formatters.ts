/**
 * Utility functions for formatting data display
 * Provides consistent formatting across the application
 */

/**
 * Format currency values in Rwandan Francs (RWF)
 * @param value - The numeric value to format
 * @param showDecimals - Whether to show decimal places (default: false for RWF)
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number | null | undefined, showDecimals: boolean = false): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'RWF 0';
  }

  const formatter = new Intl.NumberFormat('rw-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });

  // For RWF, we typically don't show decimals unless specifically requested
  return formatter.format(value).replace('RF', 'RWF');
};

/**
 * Format weight values with proper units
 * @param value - The numeric value to format
 * @param unit - The unit (default: 'kg')
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted weight string
 */
export const formatWeight = (value: number | null | undefined, unit: string = 'kg', decimals: number = 2): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return `0 ${unit}`;
  }

  return `${value.toFixed(decimals)} ${unit}`;
};

/**
 * Format percentage values
 * @param value - The numeric value to format (as decimal, e.g., 0.75 for 75%)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number | null | undefined, decimals: number = 1): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Format date values for display
 * @param date - The date to format (string, Date, or null/undefined)
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export const formatDate = (
  date: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
): string => {
  if (!date) {
    return 'Not set';
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  return new Intl.DateTimeFormat('en-RW', options).format(dateObj);
};

/**
 * Format date and time for display
 * @param date - The date to format
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format time only for display
 * @param date - The date to format
 * @returns Formatted time string
 */
export const formatTime = (date: string | Date | null | undefined): string => {
  return formatDate(date, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format numbers with proper thousand separators
 * @param value - The numeric value to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string
 */
export const formatNumber = (value: number | null | undefined, decimals: number = 0): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  return new Intl.NumberFormat('en-RW', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Format duration in hours and minutes
 * @param minutes - Duration in minutes
 * @returns Formatted duration string
 */
export const formatDuration = (minutes: number | null | undefined): string => {
  if (minutes === null || minutes === undefined || isNaN(minutes)) {
    return '0 min';
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Format temperature values
 * @param value - The temperature value
 * @param unit - Temperature unit (default: '°C')
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted temperature string
 */
export const formatTemperature = (value: number | null | undefined, unit: string = '°C', decimals: number = 1): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return `-- ${unit}`;
  }

  return `${value.toFixed(decimals)}${unit}`;
};

/**
 * Format humidity values
 * @param value - The humidity value (as percentage)
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted humidity string
 */
export const formatHumidity = (value: number | null | undefined, decimals: number = 0): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '--%';
  }

  return `${value.toFixed(decimals)}%`;
};
