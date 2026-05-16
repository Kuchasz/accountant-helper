import { Button } from '@base-ui/react/button';
import { Bell, Export, MagnifyingGlass, Plus } from '@phosphor-icons/react';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1 max-w-xl">
          <div className="relative w-full">
            <MagnifyingGlass
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded">
              ⌘ K
            </kbd>
          </div>
        </div>
        <div className="flex items-center space-x-3 ml-4">
          <div className="flex items-center -space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 border-2 border-white" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border-2 border-white" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-teal-500 border-2 border-white" />
          </div>
          <Button className="p-2 hover:bg-gray-100 rounded-lg border-0 bg-transparent cursor-pointer">
            <Plus size={20} className="text-gray-600" />
          </Button>
          <Button className="p-2 hover:bg-gray-100 rounded-lg relative border-0 bg-transparent cursor-pointer">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
          </Button>
          <Button className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2 border-0 cursor-pointer">
            <Export size={16} weight="bold" />
            <span>Export</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
