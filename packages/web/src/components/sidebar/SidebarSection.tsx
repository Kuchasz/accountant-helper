import { SidebarMenuItem } from './SidebarMenuItem';
import type { SidebarMenuItemProps } from './SidebarMenuItem';

interface SidebarSectionProps {
  label: string;
  items: SidebarMenuItemProps[];
}

export function SidebarSection({ label, items }: SidebarSectionProps) {
  return (
    <div className="px-3 mt-6">
      <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
        {label}
      </p>
      <div className="space-y-1">
        {items.map((item) => (
          <SidebarMenuItem key={item.path} {...item} />
        ))}
      </div>
    </div>
  );
}
