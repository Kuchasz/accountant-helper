import { Button } from '@base-ui/react/button';
import { Popover } from '@base-ui/react/popover';
import { Select } from '@base-ui/react/select';
import { Tooltip } from '@base-ui/react/tooltip';
import {
  CaretDown,
  Funnel,
  Gear,
  Package,
  Plus,
  ShoppingBag,
  TrendUp,
} from '@phosphor-icons/react';
import { useState } from 'react';

export function DashboardContent() {
  const [selectedYear, setSelectedYear] = useState('This year');

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your sales and performance of your strategy
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Popover.Root>
            <Popover.Trigger
              render={(props) => (
                <Button
                  {...props}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2 bg-white cursor-pointer"
                >
                  <Funnel size={16} />
                  <span>Filters</span>
                </Button>
              )}
            />
            <Popover.Portal>
              <Popover.Positioner sideOffset={8}>
                <Popover.Popup className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[200px] z-50">
                  <Popover.Arrow className="fill-white" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900">Filter options</p>
                    <p className="text-xs text-gray-500">Coming soon...</p>
                  </div>
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>
          <Button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2 border-0 cursor-pointer">
            <Plus size={16} weight="bold" />
            <span>Add Widget</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Product Overview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Product overview</h3>
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger
                  render={(props) => (
                    <Button
                      {...props}
                      className="text-gray-400 hover:text-gray-600 border-0 bg-transparent p-0 cursor-pointer"
                    >
                      <Gear size={16} />
                    </Button>
                  )}
                />
                <Tooltip.Portal>
                  <Tooltip.Positioner sideOffset={4}>
                    <Tooltip.Popup className="bg-gray-900 text-white text-xs px-2 py-1 rounded">
                      <Tooltip.Arrow className="fill-gray-900" />
                      Settings
                    </Tooltip.Popup>
                  </Tooltip.Positioner>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
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
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger
                  render={(props) => (
                    <Button
                      {...props}
                      className="text-gray-400 hover:text-gray-600 border-0 bg-transparent p-0 cursor-pointer"
                    >
                      <Gear size={16} />
                    </Button>
                  )}
                />
                <Tooltip.Portal>
                  <Tooltip.Positioner sideOffset={4}>
                    <Tooltip.Popup className="bg-gray-900 text-white text-xs px-2 py-1 rounded">
                      <Tooltip.Arrow className="fill-gray-900" />
                      Settings
                    </Tooltip.Popup>
                  </Tooltip.Positioner>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
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
            {[40, 60, 35, 70, 45, 85, 50].map((height, index) => (
              <div key={`sales-bar-${height}-${index}`} className="flex-1 mx-0.5">
                <div
                  className="bg-gradient-to-t from-orange-500 to-orange-400 rounded-t"
                  style={{ height: `${height}%` }}
                />
              </div>
            ))}
          </div>
          <Button className="mt-4 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center border-0 bg-transparent p-0 cursor-pointer">
            See Details
            <CaretDown size={16} className="ml-1 -rotate-90" />
          </Button>
        </div>

        {/* Product Revenue */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Product Revenue</h3>
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger
                  render={(props) => (
                    <Button
                      {...props}
                      className="text-gray-400 hover:text-gray-600 border-0 bg-transparent p-0 cursor-pointer"
                    >
                      <Gear size={16} />
                    </Button>
                  )}
                />
                <Tooltip.Portal>
                  <Tooltip.Positioner sideOffset={4}>
                    <Tooltip.Popup className="bg-gray-900 text-white text-xs px-2 py-1 rounded">
                      <Tooltip.Arrow className="fill-gray-900" />
                      Settings
                    </Tooltip.Popup>
                  </Tooltip.Positioner>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
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
            <svg
              className="w-full h-full -rotate-90"
              viewBox="0 0 100 100"
              aria-label="Revenue chart"
            >
              <title>Product Revenue Chart</title>
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
          <Button className="mt-4 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center border-0 bg-transparent p-0 cursor-pointer">
            See Details
            <CaretDown size={16} className="ml-1 -rotate-90" />
          </Button>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Analytics Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-gray-700">Analytics</h3>
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger
                  render={(props) => (
                    <Button
                      {...props}
                      className="text-gray-400 hover:text-gray-600 border-0 bg-transparent p-0 cursor-pointer"
                    >
                      <Gear size={16} />
                    </Button>
                  )}
                />
                <Tooltip.Portal>
                  <Tooltip.Positioner sideOffset={4}>
                    <Tooltip.Popup className="bg-gray-900 text-white text-xs px-2 py-1 rounded">
                      <Tooltip.Arrow className="fill-gray-900" />
                      Settings
                    </Tooltip.Popup>
                  </Tooltip.Positioner>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
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
              {[30, 25, 35, 28, 40, 75, 45, 35, 30, 40, 35, 38].map((height, index) => (
                <div
                  key={`analytics-bar-${height}-${index}`}
                  className="flex-1 mx-1 relative group"
                >
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
                  {index === 5 && (
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
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger
                  render={(props) => (
                    <Button
                      {...props}
                      className="text-gray-400 hover:text-gray-600 border-0 bg-transparent p-0 cursor-pointer"
                    >
                      <Gear size={16} />
                    </Button>
                  )}
                />
                <Tooltip.Portal>
                  <Tooltip.Positioner sideOffset={4}>
                    <Tooltip.Popup className="bg-gray-900 text-white text-xs px-2 py-1 rounded">
                      <Tooltip.Arrow className="fill-gray-900" />
                      Settings
                    </Tooltip.Popup>
                  </Tooltip.Positioner>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
          <div className="flex items-center justify-between mb-4">
            <Select.Root
              value={selectedYear}
              onValueChange={(value) => value && setSelectedYear(value[0])}
            >
              <Select.Trigger className="text-sm text-gray-600 border-0 bg-transparent p-0 cursor-pointer flex items-center space-x-1">
                <Select.Value placeholder="Select year">{selectedYear}</Select.Value>
                <CaretDown size={16} className="text-gray-400" />
              </Select.Trigger>
              <Select.Positioner sideOffset={8}>
                <Select.Popup className="bg-white border border-gray-200 rounded-lg shadow-lg p-1 min-w-[140px] z-50">
                  <Select.Item
                    value="This year"
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    <Select.ItemText>This year</Select.ItemText>
                  </Select.Item>
                  <Select.Item
                    value="Last year"
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    <Select.ItemText>Last year</Select.ItemText>
                  </Select.Item>
                  <Select.Item
                    value="Last 6 months"
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    <Select.ItemText>Last 6 months</Select.ItemText>
                  </Select.Item>
                </Select.Popup>
              </Select.Positioner>
            </Select.Root>
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger
                  render={(props) => (
                    <Button
                      {...props}
                      className="p-1.5 hover:bg-gray-100 rounded border-0 bg-transparent cursor-pointer"
                    >
                      <Funnel size={16} className="text-gray-400" />
                    </Button>
                  )}
                />
                <Tooltip.Portal>
                  <Tooltip.Positioner sideOffset={4}>
                    <Tooltip.Popup className="bg-gray-900 text-white text-xs px-2 py-1 rounded">
                      <Tooltip.Arrow className="fill-gray-900" />
                      Filter
                    </Tooltip.Popup>
                  </Tooltip.Positioner>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg
              className="w-full h-full -rotate-90"
              viewBox="0 0 100 100"
              aria-label="Sales performance"
            >
              <title>Sales Performance Chart</title>
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
          <Button className="mt-4 w-full text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center justify-center border-0 bg-transparent cursor-pointer">
            See Details
            <CaretDown size={16} className="ml-1 -rotate-90" />
          </Button>
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
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger
                    render={(props) => (
                      <Button
                        {...props}
                        className="text-gray-400 hover:text-gray-600 border-0 bg-transparent p-0 cursor-pointer"
                      >
                        <Gear size={16} />
                      </Button>
                    )}
                  />
                  <Tooltip.Portal>
                    <Tooltip.Positioner sideOffset={4}>
                      <Tooltip.Popup className="bg-gray-900 text-white text-xs px-2 py-1 rounded">
                        <Tooltip.Arrow className="fill-gray-900" />
                        Settings
                      </Tooltip.Popup>
                    </Tooltip.Positioner>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
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
              {['MON', 'TUE', 'WED'].map((day, index) => (
                <div key={day} className="flex items-center space-x-3">
                  <span className="text-xs text-gray-500 w-8">{day}</span>
                  <div className="flex-1">
                    <div
                      className={`h-6 rounded ${index === 1 ? 'bg-orange-500' : 'bg-orange-200'}`}
                      style={{ width: `${[70, 90, 45][index]}%` }}
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
            <Button className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center border-0 bg-transparent p-0 cursor-pointer">
              See Details
              <CaretDown size={16} className="ml-1 -rotate-90" />
            </Button>
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
  );
}
