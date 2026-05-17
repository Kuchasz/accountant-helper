import { Button } from '@base-ui/react/button';
import { ScrollArea } from '@base-ui/react/scroll-area';
import {
  CaretDown,
  FileDashed,
  FilePdf,
  Gear,
  GridFour,
  Lightning,
  UsersThree,
} from '@phosphor-icons/react';
import { Link as RouterLink } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useSidebar } from '../contexts/SidebarContext';
import { trpc } from '../lib/trpc';
import { SidebarMenuItem } from './sidebar/SidebarMenuItem';
import type { SidebarMenuItemProps } from './sidebar/SidebarMenuItem';
import { SidebarSection } from './sidebar/SidebarSection';

export function Sidebar() {
  const { t } = useTranslation();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { data: payers } = trpc.getPayersList.useQuery();

  const menuItems: SidebarMenuItemProps[] = [
    { icon: GridFour, label: t('sidebar.dashboard'), path: '/' },
  ];

  const zusItems: SidebarMenuItemProps[] = [
    { icon: UsersThree, label: t('sidebar.zusPayersLabel'), path: '/zus/payers', badge: payers?.length },
  ];

  const toolsItems: SidebarMenuItemProps[] = [
    { icon: FileDashed, label: t('sidebar.xmlFixer'), path: '/tools/xml-fixer' },
    { icon: FilePdf, label: t('sidebar.documentCompressor'), path: '/tools/document-compressor' },
  ];

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300`}>
      {/* Logo */}
      <div className={`border-b border-gray-200 dark:border-gray-700 ${isCollapsed ? 'py-4 px-3' : 'p-6'}`}>
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 dark:bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lightning size={24} weight="fill" className="text-white dark:text-gray-900" />
            </div>
            <Button 
              onClick={toggleSidebar}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border-0 bg-transparent cursor-pointer transition-transform"
            >
              <CaretDown size={16} className="text-gray-500 dark:text-gray-400 rotate-90 transition-transform" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-900 dark:bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lightning size={24} weight="fill" className="text-white dark:text-gray-900" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {t('sidebar.companyName')}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('sidebar.freePlan')}</p>
              </div>
            </div>
            <Button 
              onClick={toggleSidebar}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border-0 bg-transparent cursor-pointer transition-transform flex-shrink-0"
            >
              <CaretDown size={16} className="text-gray-500 dark:text-gray-400 transition-transform" />
            </Button>
          </div>
        )}
      </div>

      {/* Scrollable nav */}
      <ScrollArea.Root className="flex-1 overflow-hidden">
        <ScrollArea.Viewport className="h-full py-4 overflow-y-auto">
          <div className="px-3">
            {!isCollapsed && (
              <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                {t('sidebar.mainMenu')}
              </p>
            )}
            <div className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path} {...item} isCollapsed={isCollapsed} />
              ))}
            </div>
          </div>

          <SidebarSection label={t('sidebar.zus')} items={zusItems} isCollapsed={isCollapsed} />
          <SidebarSection label={t('sidebar.tools')} items={toolsItems} isCollapsed={isCollapsed} />
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          orientation="vertical"
          className="flex w-2 bg-gray-100 dark:bg-gray-800 rounded-full p-0.5"
        >
          <ScrollArea.Thumb className="flex-1 bg-gray-400 dark:bg-gray-600 rounded-full hover:bg-gray-500 dark:hover:bg-gray-500 transition-colors" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3 space-y-1">
        <RouterLink to="/settings" className="block">
          <Button className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-0 bg-transparent cursor-pointer`}>
            <Gear size={20} />
            {!isCollapsed && <span>{t('sidebar.settings')}</span>}
          </Button>
        </RouterLink>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2.5`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex-shrink-0" />
          {!isCollapsed && (
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Jevline Klef</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
