import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationLinkProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  showIcon?: boolean;
  variant?: 'link' | 'button';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Reusable navigation link component for cross-module navigation
 * Provides consistent styling and behavior across the application
 */
export const NavigationLink: React.FC<NavigationLinkProps> = ({
  children,
  onClick,
  className = '',
  showIcon = true,
  variant = 'link',
  size = 'md'
}) => {
  const baseStyles = variant === 'link'
    ? "hover:underline cursor-pointer"
    : "";

  const sizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        size={size === 'sm' ? 'sm' : 'default'}
        onClick={onClick}
        className={`${sizeStyles[size]} ${className}`}
      >
        {showIcon && <ExternalLink className="h-3 w-3 mr-1" />}
        {children}
      </Button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${className}`}
    >
      {children}
      {showIcon && <ExternalLink className="h-3 w-3 ml-1" />}
    </button>
  );
};

interface QuickNavigationProps {
  links: Array<{
    label: string;
    action: () => void;
    icon?: string;
  }>;
  className?: string;
}

/**
 * Quick navigation menu component
 * Displays a set of navigation links in a consistent format
 */
export const QuickNavigation: React.FC<QuickNavigationProps> = ({
  links,
  className = ''
}) => {
  return (
    <div className={`flex gap-2 ${className}`}>
      {links.map((link, index) => (
        <NavigationLink
          key={index}
          onClick={link.action}
          variant="button"
          size="sm"
          className="text-xs"
        >
          {link.label}
        </NavigationLink>
      ))}
    </div>
  );
};

interface EntityLinkProps {
  id: number;
  label: string;
  onClick: (id: number) => void;
  className?: string;
  description?: string;
}

/**
 * Component for linking to specific entities (batches, feed types, etc.)
 * Provides consistent styling for entity references
 */
export const EntityLink: React.FC<EntityLinkProps> = ({
  id,
  label,
  onClick,
  className = '',
  description
}) => {
  return (
    <div className='flex gap-1'>
      <NavigationLink
        onClick={() => onClick(id)}
        className={`font-medium ${className}`}
      >
        {label}
      </NavigationLink>
      {description && (
        <div className="text-sm text-gray-500">{description}</div>
      )}
    </div>
  );
};
