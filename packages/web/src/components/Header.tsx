import { Button } from '@base-ui/react/button';
import { Select } from '@base-ui/react/select';
import {
  Buildings,
  CaretDown,
  Globe,
  Moon,
  Sun,
  Warning,
} from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
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
        <div className="flex items-center gap-4">
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
                <CaretDown
                  size={16}
                  className="absolute right-3 text-gray-500 dark:text-gray-400 pointer-events-none"
                />
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
        </div>
        <div className="flex items-center space-x-3 ml-4">
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
        </div>
      </div>
    </header>
  );
}
