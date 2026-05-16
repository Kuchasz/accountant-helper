import { Button } from '@base-ui/react/button';
import { Input } from '@base-ui/react/input';
import { Bell, Buildings, Export, MagnifyingGlass, Moon, Plus, Sun, Warning } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { trpc } from '../lib/trpc';
import { useTheme } from '../contexts/ThemeContext';

interface Company {
  id: number;
  name: string;
  databaseName: string;
}

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isConfigDbAvailable, setIsConfigDbAvailable] = useState(false);

  const { data: configDbStatus } = trpc.checkConfigDbAvailable.useQuery();
  const { data: companies = [], isLoading: loadingCompanies } = trpc.getAvailableCompanies.useQuery(
    undefined,
    { enabled: isConfigDbAvailable, retry: false }
  );
  const { data: savedCompany } = trpc.getSelectedCompany.useQuery();
  const setCompanyMutation = trpc.setSelectedCompany.useMutation();

  useEffect(() => {
    if (configDbStatus) {
      setIsConfigDbAvailable(configDbStatus.available);
    }
  }, [configDbStatus]);

  useEffect(() => {
    if (savedCompany) {
      setSelectedCompany(savedCompany);
    }
  }, [savedCompany]);

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const companyId = Number(e.target.value);
    const company = companies.find((c: Company) => c.id === companyId);
    if (company) {
      setSelectedCompany(company);
      setCompanyMutation.mutate({
        id: company.id,
        name: company.name,
        databaseName: company.databaseName,
      });
    }
  };
  
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1 max-w-3xl gap-4">
          {/* Company Selector */}
          <div className="relative w-72">
            <Buildings 
              size={16} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none z-10" 
            />
            {!isConfigDbAvailable && (
              <Warning
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500 pointer-events-none z-10"
                weight="fill"
              />
            )}
            <select
              value={selectedCompany?.id || ''}
              onChange={handleCompanyChange}
              disabled={!isConfigDbAvailable || loadingCompanies}
              className="w-full pl-10 pr-10 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-750 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
            >
              <option value="" disabled>
                {!isConfigDbAvailable 
                  ? 'Config DB not available' 
                  : loadingCompanies 
                  ? 'Loading companies...' 
                  : 'Select Company'}
              </option>
              {companies.map((company: Company) => (
                <option key={company.id} value={company.id}>
                  {company.name} ({company.databaseName})
                </option>
              ))}
            </select>
            {/* Custom dropdown arrow */}
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ right: !isConfigDbAvailable ? '2rem' : '0.75rem' }}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {/* Search */}
          <div className="relative flex-1">
            <MagnifyingGlass
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            />
            <Input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
              ⌘ K
            </kbd>
          </div>
        </div>
        <div className="flex items-center space-x-3 ml-4">
          <div className="flex items-center -space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 border-2 border-white dark:border-gray-900" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border-2 border-white dark:border-gray-900" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-teal-500 border-2 border-white dark:border-gray-900" />
          </div>
          <Button 
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border-0 bg-transparent cursor-pointer"
          >
            {theme === 'light' ? (
              <Moon size={20} className="text-gray-600 dark:text-gray-400" />
            ) : (
              <Sun size={20} className="text-gray-600 dark:text-gray-400" />
            )}
          </Button>
          <Button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border-0 bg-transparent cursor-pointer">
            <Plus size={20} className="text-gray-600 dark:text-gray-400" />
          </Button>
          <Button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative border-0 bg-transparent cursor-pointer">
            <Bell size={20} className="text-gray-600 dark:text-gray-400" />
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
