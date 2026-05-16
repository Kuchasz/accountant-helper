import { Button } from '@base-ui/react/button';
import { ScrollArea } from '@base-ui/react/scroll-area';
import {
  CaretDown,
  ChartLine,
  Clipboard,
  ClipboardText,
  EnvelopeSimple,
  Export,
  Gear,
  GridFour,
  Link,
  Package,
  Rocket,
  ShoppingCart,
  Sparkle,
  Users,
} from '@phosphor-icons/react';
import { Link as RouterLink, useMatchRoute } from '@tanstack/react-router';

const menuItems = [
  { icon: GridFour, label: 'Dashboard', path: '/' },
  { icon: Package, label: 'Products', path: '/products' },
  { icon: ShoppingCart, label: 'Order', path: '/orders' },
  { icon: Users, label: 'Customers', path: '/customers' },
  { icon: ClipboardText, label: 'Chat', path: '/chat', badge: 22 },
];

const otherItems = [
  { icon: EnvelopeSimple, label: 'Email', path: '/email' },
  { icon: ChartLine, label: 'Analytics', path: '/analytics' },
  { icon: Link, label: 'Integration', path: '/integration' },
  { icon: Rocket, label: 'Performance', path: '/performance' },
];

const accountItems = [
  { icon: Gear, label: 'Account', path: '/account' },
  { icon: Users, label: 'Members', path: '/members' },
];

export function Sidebar() {
  const matchRoute = useMatchRoute();

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-900 dark:bg-gray-100 rounded-lg flex items-center justify-center">
            <Sparkle size={24} weight="fill" className="text-white dark:text-gray-900" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Veselity Inc.
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Free Plan</p>
          </div>
        </div>
        <Button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border-0 bg-transparent cursor-pointer">
          <CaretDown size={16} className="text-gray-500 dark:text-gray-400" />
        </Button>
      </div>

      {/* Main Menu */}
      <ScrollArea.Root className="flex-1 overflow-hidden">
        <ScrollArea.Viewport className="h-full py-4 overflow-y-auto">
          <div className="px-3">
            <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Main Menu
            </p>
            <div className="space-y-1">
              {menuItems.map((item) => {
                const isActive = matchRoute({ to: item.path, fuzzy: false });
                return (
                  <RouterLink key={item.path} to={item.path} className="block">
                    <Button
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border-0 cursor-pointer ${
                        isActive
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon size={20} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                          {item.badge}
                        </span>
                      )}
                    </Button>
                  </RouterLink>
                );
              })}
            </div>
          </div>

          {/* Other Section */}
          <div className="px-3 mt-6">
            <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Other
            </p>
            <div className="space-y-1">
              {otherItems.map((item) => (
                <RouterLink key={item.path} to={item.path} className="block">
                  <Button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-0 bg-transparent cursor-pointer">
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </Button>
                </RouterLink>
              ))}
            </div>
          </div>

          {/* Account Section */}
          <div className="px-3 mt-6">
            <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Account
            </p>
            <div className="space-y-1">
              {accountItems.map((item) => (
                <RouterLink key={item.path} to={item.path} className="block">
                  <Button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-0 bg-transparent cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </div>
                    {item.label === 'Account' && (
                      <Gear size={16} className="text-gray-400 dark:text-gray-500" />
                    )}
                  </Button>
                </RouterLink>
              ))}
            </div>
          </div>
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
          <Button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-0 bg-transparent cursor-pointer">
            <Gear size={20} />
            <span>Settings</span>
          </Button>
        </RouterLink>
        <Button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-0 bg-transparent cursor-pointer">
          <Clipboard size={20} />
          <span>Feedback</span>
        </Button>
        <div className="flex items-center space-x-3 px-3 py-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Jevline Klef</p>
          </div>
          <Button className="text-orange-500 dark:text-orange-400 border-0 bg-transparent p-0 cursor-pointer">
            <Export size={20} />
          </Button>
        </div>
      </div>
    </aside>
  );
}
