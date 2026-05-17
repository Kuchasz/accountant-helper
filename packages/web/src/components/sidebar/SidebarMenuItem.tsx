import { Button } from '@base-ui/react/button';
import { Tooltip } from '@base-ui/react/tooltip';
import type { Icon } from '@phosphor-icons/react';
import { Link as RouterLink, useMatchRoute } from '@tanstack/react-router';

export interface SidebarMenuItemProps {
  icon: Icon;
  label: string;
  path: string;
  badge?: number | string;
  trailingIcon?: Icon;
  isCollapsed?: boolean;
}

export function SidebarMenuItem({
  icon: ItemIcon,
  label,
  path,
  badge,
  trailingIcon: TrailingIcon,
  isCollapsed = false,
}: SidebarMenuItemProps) {
  const matchRoute = useMatchRoute();
  const isActive = !!matchRoute({ to: path, fuzzy: false });
const buttonContent = (
    <Button
      className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border-0 cursor-pointer ${
        isActive
          ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
          : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
    >
      <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
        <ItemIcon size={20} />
        {!isCollapsed && <span>{label}</span>}
      </div>
      {!isCollapsed && badge !== undefined && (
        <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
          {badge}
        </span>
      )}
      {!isCollapsed && TrailingIcon && badge === undefined && (
        <TrailingIcon size={16} className="text-gray-400 dark:text-gray-500" />
      )}
    </Button>
  );

  if (isCollapsed) {
    return (
      <RouterLink to={path} className="block">
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger className="w-full">
              {buttonContent}
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Positioner sideOffset={4}>
                <Tooltip.Popup className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded z-50">
                  <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-700" />
                  {label}
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </RouterLink>
    );
  }

  return (
    <RouterLink to={path} className="block">
      {buttonContent}
    </RouterLink>
  );
}
