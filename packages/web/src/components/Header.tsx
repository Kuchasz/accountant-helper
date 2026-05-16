import { Button } from '@base-ui/react/button';
import { Input } from '@base-ui/react/input';
import { Select } from '@base-ui/react/select';
import {
  Bell,
  Buildings,
  CaretDown,
  Export,
  Globe,
  MagnifyingGlass,
  Moon,
  Plus,
  Sun,
  Warning,
} from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { trpc } from '../lib/trpc';

interface Company {
  id: number;
  name: string;
  databaseName: string;
}

export function Header() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isConfigDbAvailable, setIsConfigDbAvailable] = useState(false);

  const { data: configDbStatus } = trpc.checkConfigDbAvailable.useQuery();
  const { data: companies = [], isLoading: loadingCompanies } = trpc.getAvailableCompanies.useQuery(
    undefined,
    { enabled: isConfigDbAvailable, retry: false },
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

  const handleCompanyChange = (value: string | number | null) => {
    if (value === null) return;
    const companyId = typeof value === 'string' ? Number(value) : value;
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
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'pl' : 'en');
  };
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1 max-w-3xl gap-4">
          {/* Company Selector */}
          <div className="relative inline-flex min-w-[180px] max-w-sm">
            <Select.Root
              value={selectedCompany?.id?.toString() || null}
              onValueChange={handleCompanyChange}
              disabled={!isConfigDbAvailable || loadingCompanies}
            >
              <Select.Trigger className="w-full pl-10 pr-9 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-750 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center relative">
                <Buildings
                  size={16}
                  className="absolute left-3 text-gray-500 dark:text-gray-400 pointer-events-none"
                />
                {!isConfigDbAvailable && (
                  <Warning
                    size={16}
                    className="absolute right-9 text-orange-500 pointer-events-none"
                    weight="fill"
                  />
                )}
                <div className="flex-1 text-left truncate">
                  {selectedCompany ? (
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {selectedCompany.name}
                    </span>
                  ) : (
                    <span className="text-sm">
                      {!isConfigDbAvailable
                        ? t('header.configDbNotAvailable')
                        : loadingCompanies
                          ? t('header.loadingCompanies')
                          : t('header.selectCompany')}
                    </span>
                  )}
                </div>
                <CaretDown size={16} className="absolute right-3 text-gray-500 dark:text-gray-400 pointer-events-none" />
              </Select.Trigger>
              <Select.Portal>
                <Select.Positioner className="z-50">
                  <Select.Popup className="mt-1 max-h-60 overflow-y-auto overflow-x-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                    {companies.map((company: Company) => (
                      <Select.Item
                        key={company.id}
                        value={company.id.toString()}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700 data-[selected]:bg-orange-50 dark:data-[selected]:bg-orange-900/20"
                      >
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {company.name}
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-normal ml-2">
                            • {company.databaseName}
                          </span>
                        </span>
                      </Select.Item>
                    ))}
                  </Select.Popup>
                </Select.Positioner>
              </Select.Portal>
            </Select.Root>
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <MagnifyingGlass
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            />
            <Input
              type="text"
              placeholder={t('header.searchPlaceholder')}
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
            onClick={toggleLanguage}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border-0 bg-transparent cursor-pointer relative"
            title={language === 'en' ? 'Switch to Polish' : 'Przełącz na angielski'}
          >
            <Globe size={20} className="text-gray-600 dark:text-gray-400" />
            <span className="absolute bottom-0 right-0 text-[8px] font-bold text-gray-600 dark:text-gray-400 uppercase">
              {language}
            </span>
          </Button>
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
            <span>{t('header.export')}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
