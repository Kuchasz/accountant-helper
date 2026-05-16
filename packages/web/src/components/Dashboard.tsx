import { Input } from '@base-ui/react/input';
import {
  Bell,
  CaretDown,
  ChartLine,
  Clipboard,
  ClipboardText,
  EnvelopeSimple,
  Export,
  Funnel,
  Gear,
  GridFour,
  Link,
  MagnifyingGlass,
  Package,
  Plus,
  Rocket,
  ShoppingBag,
  ShoppingCart,
  Sparkle,
  TrendUp,
  Users,
} from '@phosphor-icons/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function Dashboard() {
  const { t } = useTranslation();
  const [selectedMenu, setSelectedMenu] = useState('Dashboard');
  const weekdays = [
    t('dashboard.mon'),
    t('dashboard.tue'),
    t('dashboard.wed'),
  ];

  const menuItems = [
    { icon: GridFour, label: 'Dashboard' },
    { icon: Package, label: 'Products' },
    { icon: ShoppingCart, label: 'Order' },
    { icon: Users, label: 'Customers' },
    { icon: ClipboardText, label: 'Chat', badge: 22 },
  ];

  const otherItems = [
    { icon: EnvelopeSimple, label: 'Email' },
    { icon: ChartLine, label: 'Analytics' },
    { icon: Link, label: 'Integration' },
    { icon: Rocket, label: 'Performance' },
  ];

  const accountItems = [
    { icon: Gear, label: 'Account' },
    { icon: Users, label: 'Members' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
              <Sparkle size={24} weight="fill" className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900">Veselity Inc.</h1>
              <p className="text-xs text-gray-500">Free Plan</p>
            </div>
          </div>
          <button className="p-1.5 hover:bg-gray-100 rounded-lg">
            <CaretDown size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Main Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-3">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Main Menu
            </p>
            <div className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setSelectedMenu(item.label)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedMenu === item.label
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-700 rounded">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Other Section */}
          <div className="px-3 mt-6">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Other
            </p>
            <div className="space-y-1">
              {otherItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setSelectedMenu(item.label)}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Account Section */}
          <div className="px-3 mt-6">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Account
            </p>
            <div className="space-y-1">
              {accountItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setSelectedMenu(item.label)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </div>
                  {item.label === 'Account' && <Gear size={16} className="text-gray-400" />}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 p-3 space-y-1">
          <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Gear size={20} />
            <span>Settings</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Clipboard size={20} />
            <span>Feedback</span>
          </button>
          <div className="flex items-center space-x-3 px-3 py-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Jevline Klef</p>
            </div>
            <button className="text-orange-500">
              <Export size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1 max-w-xl">
              <div className="relative w-full">
                <MagnifyingGlass
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <Input
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
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Plus size={20} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
              </button>
              <button className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2">
                <Export size={16} weight="bold" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                Track your sales and performance of your strategy
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2">
                <Funnel size={16} />
                <span>Filters</span>
              </button>
              <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2">
                <Plus size={16} weight="bold" />
                <span>Add Widget</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Product Overview */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Product overview</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <Gear size={16} />
                </button>
              </div>
              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-900">$43,630</div>
                <p className="text-sm text-gray-500 mt-1">Total sales</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-600 mb-2">Select by product</p>
                <div className="flex gap-2">
                  <span className="px-3 py-1.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-lg flex items-center space-x-1">
                    <span>Cosmetics</span>
                    <span className="ml-1 px-1.5 py-0.5 bg-orange-200 rounded">8</span>
                  </span>
                  <span className="px-3 py-1.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-lg flex items-center space-x-1">
                    <span>HQ sweeds</span>
                    <span className="ml-1 px-1.5 py-0.5 bg-orange-200 rounded">8</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Active Sales */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Active sales</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <Gear size={16} />
                </button>
              </div>
              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-900">$27,064</div>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm text-gray-500">vs last month</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                    +12%
                  </span>
                </div>
              </div>
              <div className="flex items-end justify-between h-20">
                {[40, 60, 35, 70, 45, 85, 50].map((height, i) => (
                  <div key={i} className="flex-1 mx-0.5">
                    <div
                      className="bg-gradient-to-t from-orange-500 to-orange-400 rounded-t"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                ))}
              </div>
              <button className="mt-4 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center">
                See Details
                <CaretDown size={16} className="ml-1 -rotate-90" />
              </button>
            </div>

            {/* Product Revenue */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Product Revenue</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <Gear size={16} />
                </button>
              </div>
              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-900">$16,568</div>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm text-gray-500">vs last month</span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                    -7%
                  </span>
                </div>
              </div>
              <div className="relative w-24 h-24 mx-auto">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#f3f4f6" strokeWidth="12" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#fb923c"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray="251.2"
                    strokeDashoffset="62.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <button className="mt-4 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center">
                See Details
                <CaretDown size={16} className="ml-1 -rotate-90" />
              </button>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Analytics Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-gray-700">Analytics</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <Gear size={16} />
                </button>
              </div>
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900">-$4.5430</div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-500">sales</span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                    -8.04%
                  </span>
                </div>
              </div>
              <div className="relative h-48">
                <div className="absolute inset-0 flex items-end justify-between">
                  {[30, 25, 35, 28, 40, 75, 45, 35, 30, 40, 35, 38].map((height, i) => (
                    <div key={i} className="flex-1 mx-1 relative group">
                      <div
                        className="bg-orange-200 rounded-t relative overflow-hidden"
                        style={{ height: `${height}%` }}
                      >
                        <div
                          className="absolute inset-0 bg-gradient-to-b from-orange-400 to-orange-300"
                          style={{
                            clipPath: 'polygon(0 20%, 100% 10%, 100% 100%, 0% 100%)',
                          }}
                        />
                      </div>
                      {i === 5 && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded">
                          -18%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between mt-4 text-xs text-gray-500">
                <span>JAN</span>
                <span>FEB</span>
                <span>MAR</span>
                <span>APR</span>
                <span>MAY</span>
                <span>JUN</span>
                <span>JUL</span>
                <span>AUG</span>
              </div>
            </div>

            {/* Sales Performance */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Sales Performance</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <Gear size={16} />
                </button>
              </div>
              <div className="flex items-center justify-between mb-4">
                <button className="text-sm text-gray-600">This year</button>
                <CaretDown size={16} className="text-gray-400" />
                <button className="p-1.5 hover:bg-gray-100 rounded">
                  <Funnel size={16} className="text-gray-400" />
                </button>
              </div>
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="35" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    stroke="#fb923c"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray="219.8"
                    strokeDashoffset="180"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="#fed7aa"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="263.8"
                    strokeDashoffset="200"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold text-gray-900">17.9%</div>
                  <div className="text-xs text-gray-500 mt-1">Since yesterday</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-0.5 bg-orange-500 rounded" />
                    <span className="text-gray-600">Total Sales per day</span>
                  </div>
                  <span className="font-medium text-gray-900">For week</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-0.5 bg-orange-200 rounded" />
                    <span className="text-gray-600">Average Sales</span>
                  </div>
                  <span className="font-medium text-gray-900">For today</span>
                </div>
              </div>
              <button className="mt-4 w-full text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center justify-center">
                See Details
                <CaretDown size={16} className="ml-1 -rotate-90" />
              </button>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversion & Total Visits */}
            <div className="space-y-6">
              {/* Conversion */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700">This year</h3>
                  <CaretDown size={16} className="text-gray-400" />
                </div>
                <div className="mb-2">
                  <div className="text-3xl font-bold text-gray-900">0.73%</div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-gray-500">Convrate</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded flex items-center">
                      <TrendUp size={12} className="mr-1" />
                      +1.9%
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Visits */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700">Total visits by hourly</h3>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Gear size={16} />
                  </button>
                </div>
                <div className="mb-4">
                  <div className="text-3xl font-bold text-gray-900">288,142</div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                      -2.9%
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {weekdays.map((day, i) => (
                    <div key={day} className="flex items-center space-x-3">
                      <span className="text-xs text-gray-500 w-8">{day}</span>
                      <div className="flex-1">
                        <div
                          className={`h-6 rounded ${i === 1 ? 'bg-orange-500' : 'bg-orange-200'}`}
                          style={{ width: `${[70, 90, 45][i]}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Products */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-gray-700">Top Products</h3>
                <button className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center">
                  See Details
                  <CaretDown size={16} className="ml-1 -rotate-90" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                        <div className="flex items-center space-x-1">
                          <Package size={14} />
                          <span>Product</span>
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                        Sales
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                        Revenue
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                        Stock
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded flex items-center justify-center">
                            <ShoppingBag size={16} className="text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">Bled Shorts</div>
                            <div className="text-xs text-gray-500">Instagram Inves...</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900">127</div>
                        <div className="text-xs text-gray-500">pcs</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm font-medium text-gray-900">$1,890</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900">100</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                          In stock
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded flex items-center justify-center">
                            <ShoppingBag size={16} className="text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">T Shirts - Me</div>
                            <div className="text-xs text-gray-500">Instagram Inves...</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900">540</div>
                        <div className="text-xs text-gray-500">pcs</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm font-medium text-gray-900">$2,819</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900">100</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                          Out of stock
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
