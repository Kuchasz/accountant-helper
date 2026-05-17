import { Button } from '@base-ui/react/button';
import { Field } from '@base-ui/react/field';
import { Input } from '@base-ui/react/input';
import { Switch } from '@base-ui/react/switch';
import { CheckCircle, Database, FileText, XCircle } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../lib/trpc';

interface ConnectionFormData {
  server: string;
  database: string;
  username: string;
  password: string;
  port: number;
  encrypt: boolean;
  trustServerCertificate: boolean;
  isConfigured: boolean;
}

const initialFormData: ConnectionFormData = {
  server: '',
  database: '',
  username: '',
  password: '',
  port: 1433,
  encrypt: true,
  trustServerCertificate: false,
  isConfigured: false,
};

export function SettingsPage() {
  const { t } = useTranslation();
  const [optimaForm, setOptimaForm] = useState<ConnectionFormData>(initialFormData);
  const [payerForm, setPayerForm] = useState<ConnectionFormData>(initialFormData);
  const [testResult, setTestResult] = useState<{
    type: 'optima' | 'payer';
    success: boolean;
    message: string;
  } | null>(null);
  const [isTesting, setIsTesting] = useState<'optima' | 'payer' | null>(null);
  const [dueDateDay, setDueDateDay] = useState<number>(20);
  const [dueDateSaved, setDueDateSaved] = useState(false);

  const utils = trpc.useUtils();
  const { data: connections = [], isLoading } = trpc.getSqlServerConnections.useQuery();
  const { data: dueDateSetting } = trpc.getSetting.useQuery({ key: 'zus_due_date_day' });

  const setSettingMutation = trpc.setSetting.useMutation({
    onSuccess: () => {
      utils.getSetting.invalidate({ key: 'zus_due_date_day' });
      setDueDateSaved(true);
      setTimeout(() => setDueDateSaved(false), 2000);
    },
  });

  const updateMutation = trpc.updateSqlServerConnection.useMutation({
    onSuccess: () => {
      utils.getSqlServerConnections.invalidate();
    },
  });

  const testMutation = trpc.testSqlServerConnection.useMutation({
    onSuccess: (result: { success: boolean; message: string }) => {
      const dbType = isTesting;
      if (dbType) {
        setTestResult({ type: dbType, success: result.success, message: result.message });
      }
      setIsTesting(null);
    },
    onError: () => {
      const dbType = isTesting;
      if (dbType) {
        setTestResult({
          type: dbType,
          success: false,
          message: t('sqlSettings.connectionTestFailed'),
        });
      }
      setIsTesting(null);
    },
  });

  // Load connections into forms
  useEffect(() => {
    if (connections.length > 0) {
      const optima = connections.find((c) => c.name === 'optima');
      const payer = connections.find((c) => c.name === 'payer');

      if (optima) {
        setOptimaForm({
          server: optima.server || '',
          database: optima.database || '',
          username: optima.username || '',
          password: optima.password || '',
          port: optima.port || 1433,
          encrypt: optima.encrypt ?? true,
          trustServerCertificate: optima.trustServerCertificate ?? false,
          isConfigured: optima.isConfigured ?? false,
        });
      }

      if (payer) {
        setPayerForm({
          server: payer.server || '',
          database: payer.database || '',
          username: payer.username || '',
          password: payer.password || '',
          port: payer.port || 1433,
          encrypt: payer.encrypt ?? true,
          trustServerCertificate: payer.trustServerCertificate ?? false,
          isConfigured: payer.isConfigured ?? false,
        });
      }
    }
  }, [connections]);

  useEffect(() => {
    if (dueDateSetting?.value) {
      const parsed = Number.parseInt(dueDateSetting.value);
      if (!Number.isNaN(parsed)) setDueDateDay(parsed);
    }
  }, [dueDateSetting]);

  const handleSave = (dbType: 'optima' | 'payer') => {
    const form = dbType === 'optima' ? optimaForm : payerForm;
    const isConfigured = !!form.server && !!form.database && !!form.username && !!form.password;

    updateMutation.mutate({
      name: dbType,
      data: {
        ...form,
        isConfigured,
      },
    });
  };

  const handleTest = (dbType: 'optima' | 'payer') => {
    const form = dbType === 'optima' ? optimaForm : payerForm;

    if (!form.server || !form.database || !form.username || !form.password) {
      setTestResult({
        type: dbType,
        success: false,
        message: t('sqlSettings.pleaseFillAllFields'),
      });
      return;
    }

    setIsTesting(dbType);
    setTestResult(null);
    testMutation.mutate({
      server: form.server,
      database: form.database,
      username: form.username,
      password: form.password,
      port: form.port,
      encrypt: form.encrypt,
      trustServerCertificate: form.trustServerCertificate,
    });
  };

  const renderDatabaseConfig = (
    dbType: 'optima' | 'payer',
    title: string,
    description: string,
    form: ConnectionFormData,
    setForm: React.Dispatch<React.SetStateAction<ConnectionFormData>>,
  ) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Database size={24} />
            {title}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
        </div>
        {form.isConfigured && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {t('sqlSettings.configured')}
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field.Root>
            <Field.Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('sqlSettings.server')}
            </Field.Label>
            <Field.Control
              render={(props) => (
                <Input
                  {...props}
                  type="text"
                  value={form.server}
                  onValueChange={(value) => setForm({ ...form, server: value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent"
                  placeholder={t('sqlSettings.serverPlaceholder')}
                />
              )}
            />
          </Field.Root>
          <Field.Root>
            <Field.Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('sqlSettings.port')}
            </Field.Label>
            <Field.Control
              render={(props) => (
                <Input
                  {...props}
                  type="number"
                  value={form.port.toString()}
                  onValueChange={(value) =>
                    setForm({ ...form, port: Number.parseInt(value) || 1433 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent"
                />
              )}
            />
          </Field.Root>
        </div>

        <Field.Root>
          <Field.Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('sqlSettings.database')}
          </Field.Label>
          <Field.Control
            render={(props) => (
              <Input
                {...props}
                type="text"
                value={form.database}
                onValueChange={(value) => setForm({ ...form, database: value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent"
                placeholder={t('sqlSettings.databasePlaceholder')}
              />
            )}
          />
        </Field.Root>

        <div className="grid grid-cols-2 gap-4">
          <Field.Root>
            <Field.Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('sqlSettings.username')}
            </Field.Label>
            <Field.Control
              render={(props) => (
                <Input
                  {...props}
                  type="text"
                  value={form.username}
                  onValueChange={(value) => setForm({ ...form, username: value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent"
                />
              )}
            />
          </Field.Root>
          <Field.Root>
            <Field.Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('sqlSettings.password')}
            </Field.Label>
            <Field.Control
              render={(props) => (
                <Input
                  {...props}
                  type="password"
                  value={form.password}
                  onValueChange={(value) => setForm({ ...form, password: value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent"
                />
              )}
            />
          </Field.Root>
        </div>

        <div className="space-y-3 pt-2">
          <Field.Root className="flex items-center justify-between">
            <Field.Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('sqlSettings.encryptConnection')}
            </Field.Label>
            <Switch.Root
              checked={form.encrypt}
              onCheckedChange={(checked) => setForm({ ...form, encrypt: checked })}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-offset-2 data-[checked]:bg-gray-900 dark:data-[checked]:bg-gray-100 data-[unchecked]:bg-gray-300 dark:data-[unchecked]:bg-gray-600"
            >
              <Switch.Thumb className="inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-900 transition-transform data-[checked]:translate-x-6 data-[unchecked]:translate-x-1" />
            </Switch.Root>
          </Field.Root>

          <Field.Root className="flex items-center justify-between">
            <Field.Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('sqlSettings.trustServerCertificate')}
            </Field.Label>
            <Switch.Root
              checked={form.trustServerCertificate}
              onCheckedChange={(checked) => setForm({ ...form, trustServerCertificate: checked })}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-offset-2 data-[checked]:bg-gray-900 dark:data-[checked]:bg-gray-100 data-[unchecked]:bg-gray-300 dark:data-[unchecked]:bg-gray-600"
            >
              <Switch.Thumb className="inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-900 transition-transform data-[checked]:translate-x-6 data-[unchecked]:translate-x-1" />
            </Switch.Root>
          </Field.Root>
        </div>

        {testResult && testResult.type === dbType && (
          <div
            className={`p-3 rounded-lg flex items-start gap-2 ${
              testResult.success
                ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}
          >
            {testResult.success ? (
              <CheckCircle size={20} weight="fill" />
            ) : (
              <XCircle size={20} weight="fill" />
            )}
            <span className="text-sm">{testResult.message}</span>
          </div>
        )}

        <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            onClick={() => handleTest(dbType)}
            disabled={isTesting === dbType}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTesting === dbType ? t('sqlSettings.testing') : t('sqlSettings.testConnection')}
          </Button>
          <div className="flex-1" />
          <Button
            type="button"
            onClick={() => handleSave(dbType)}
            disabled={updateMutation.isPending}
            className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? t('sqlSettings.saving') : t('sqlSettings.save')}
          </Button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {t('sqlSettings.loading')}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('sqlSettings.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{t('sqlSettings.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderDatabaseConfig(
          'optima',
          t('sqlSettings.optimaDatabase'),
          t('sqlSettings.optimaDatabaseDesc'),
          optimaForm,
          setOptimaForm,
        )}
        {renderDatabaseConfig(
          'payer',
          t('sqlSettings.payerDatabase'),
          t('sqlSettings.payerDatabaseDesc'),
          payerForm,
          setPayerForm,
        )}
      </div>

      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FileText size={24} />
              {t('zusSettings.title')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('zusSettings.subtitle')}</p>
          </div>
        </div>

        <div className="max-w-xs space-y-4">
          <Field.Root>
            <Field.Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('zusSettings.dueDateDay')}
            </Field.Label>
            <Field.Control
              render={(props) => (
                <Input
                  {...props}
                  type="number"
                  value={dueDateDay.toString()}
                  onValueChange={(value) => {
                    const n = Number.parseInt(value);
                    if (!Number.isNaN(n) && n >= 1 && n <= 28) setDueDateDay(n);
                  }}
                  min={1}
                  max={28}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent"
                />
              )}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('zusSettings.dueDateDayHint')}
            </p>
          </Field.Root>

          <div className="flex items-center gap-3 pt-2">
            {dueDateSaved && (
              <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                <CheckCircle size={16} weight="fill" />
                {t('zusSettings.saved')}
              </span>
            )}
            <div className="flex-1" />
            <Button
              type="button"
              onClick={() =>
                setSettingMutation.mutate({
                  key: 'zus_due_date_day',
                  value: dueDateDay.toString(),
                  description: 'ZUS declaration due date day of month',
                })
              }
              disabled={setSettingMutation.isPending}
              className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {setSettingMutation.isPending ? t('sqlSettings.saving') : t('sqlSettings.save')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
