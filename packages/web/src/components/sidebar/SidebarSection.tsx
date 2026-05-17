import { SidebarMenuItem } from './SidebarMenuItem';
import type { SidebarMenuItemProps } from './SidebarMenuItem';

interface SidebarSectionProps {
  label: string;
  items: SidebarMenuItemProps[];
  isCollapsed?: boolean;
}

export function SidebarSection({ label, items, isCollapsed = false }: SidebarSectionProps) {
  return (
    <div className={isCollapsed ? 'mt-4' : 'mt-6'}>
      {isCollapsed && (
        <div className="mx-3 my-4 border-t border-gray-200 dark:border-gray-700" />
      )}
      <div className="px-3">
        {!isCollapsed && (
          <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            {label}
          </p>
        )}
        <div className="space-y-1">
          {items.map((item) => (
            <SidebarMenuItem key={item.path} {...item} isCollapsed={isCollapsed} />
          ))}
        </div>
      </div>
    </div>
  );
}
