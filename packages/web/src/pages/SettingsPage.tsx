import { Button } from '@base-ui/react/button';
import { Dialog } from '@base-ui/react/dialog';
import { Field } from '@base-ui/react/field';
import { Input } from '@base-ui/react/input';
import { Switch } from '@base-ui/react/switch';
import { CheckCircle, Database, PencilSimple, Plus, Trash, XCircle } from '@phosphor-icons/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../lib/trpc';

interface ConnectionFormData {
  name: string;
  type: 'config' | 'company';
  server: string;
  database: string;
  username: string;
  password: string;
  port: number;
  encrypt: boolean;
  trustServerCertificate: boolean;
  isActive: boolean;
}

const initialFormData: ConnectionFormData = {
  name: '',
  type: 'config',
  server: '',
  database: '',
  username: '',
  password: '',
  port: 1433,
  encrypt: true,
  trustServerCertificate: false,
  isActive: true,
};

export function SettingsPage() {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ConnectionFormData>(initialFormData);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const utils = trpc.useUtils();
  const { data: connections = [], isLoading } = trpc.getSqlServerConnections.useQuery();

  const createMutation = trpc.createSqlServerConnection.useMutation({
    onSuccess: () => {
      utils.getSqlServerConnections.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = trpc.updateSqlServerConnection.useMutation({
    onSuccess: () => {
      utils.getSqlServerConnections.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = trpc.deleteSqlServerConnection.useMutation({
    onSuccess: () => {
      utils.getSqlServerConnections.invalidate();
    },
  });

  const testMutation = trpc.testSqlServerConnection.useMutation({
    onSuccess: (result: { success: boolean; message: string }) => {
      setTestResult(result);
      setIsTesting(false);
    },
    onError: () => {
      setTestResult({ success: false, message: t('sqlSettings.connectionTestFailed') });
      setIsTesting(false);
    },
  });

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setTestResult(null);
  };

  const handleOpenDialog = (connection?: (typeof connections)[0]) => {
    if (connection) {
      setEditingId(connection.id);
      setFormData({
        name: connection.name,
        type: connection.type as 'config' | 'company',
        server: connection.server,
        database: connection.database,
        username: connection.username,
        password: connection.password,
        port: connection.port,
        encrypt: connection.encrypt,
        trustServerCertificate: connection.trustServerCertificate,
        isActive: connection.isActive,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleTest = () => {
    setIsTesting(true);
    setTestResult(null);
    testMutation.mutate({
      server: formData.server,
      database: formData.database,
      username: formData.username,
      password: formData.password,
      port: formData.port,
      encrypt: formData.encrypt,
      trustServerCertificate: formData.trustServerCertificate,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm(t('sqlSettings.deleteConfirm'))) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('sqlSettings.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('sqlSettings.subtitle')}
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors border-0 cursor-pointer"
        >
          <Plus size={20} />
          {t('sqlSettings.addConnection')}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {t('sqlSettings.loading')}
        </div>
      ) : connections.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Database size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {t('sqlSettings.noConnections')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('sqlSettings.noConnectionsDesc')}
          </p>
          <Button
            onClick={() => handleOpenDialog()}
            className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors border-0 cursor-pointer"
          >
            {t('sqlSettings.addConnection')}
          </Button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('sqlSettings.name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('sqlSettings.type')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('sqlSettings.server')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('sqlSettings.database')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('sqlSettings.status')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('sqlSettings.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {connections.map((connection: (typeof connections)[0]) => (
                <tr key={connection.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {connection.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        connection.type === 'config'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {connection.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {connection.server}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {connection.database}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        connection.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {connection.isActive ? t('sqlSettings.active') : t('sqlSettings.inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        onClick={() => handleOpenDialog(connection)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded border-0 cursor-pointer bg-transparent"
                        aria-label={t('sqlSettings.edit')}
                      >
                        <PencilSimple size={18} />
                      </Button>
                      <Button
                        onClick={() => handleDelete(connection.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded border-0 cursor-pointer bg-transparent"
                        aria-label={t('sqlSettings.delete')}
                      >
                        <Trash size={18} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Popup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {editingId ? t('sqlSettings.editConnection') : t('sqlSettings.addNewConnection')}
              </Dialog.Title>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Field.Root>
                  <Field.Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('sqlSettings.connectionName')}
                  </Field.Label>
                  <Field.Control
                    render={(props) => (
                      <Input
                        {...props}
                        type="text"
                        required
                        value={formData.name}
                        onValueChange={(value) => setFormData({ ...formData, name: value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent"
                        placeholder={t('sqlSettings.connectionNamePlaceholder')}
                      />
                    )}
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('sqlSettings.type')}
                  </Field.Label>
                  <Field.Control
                    render={(props) => (
                      <select
                        {...props}
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({ ...formData, type: e.target.value as 'config' | 'company' })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent"
                      >
                        <option value="config">{t('sqlSettings.configDatabase')}</option>
                        <option value="company">{t('sqlSettings.companyDatabase')}</option>
                      </select>
                    )}
                  />
                </Field.Root>

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
                          required
                          value={formData.server}
                          onValueChange={(value) => setFormData({ ...formData, server: value })}
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
                          required
                          value={formData.port.toString()}
                          onValueChange={(value) =>
                            setFormData({ ...formData, port: Number.parseInt(value) || 1433 })
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
                        required
                        value={formData.database}
                        onValueChange={(value) => setFormData({ ...formData, database: value })}
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
                          required
                          value={formData.username}
                          onValueChange={(value) => setFormData({ ...formData, username: value })}
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
                          required
                          value={formData.password}
                          onValueChange={(value) => setFormData({ ...formData, password: value })}
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
                      checked={formData.encrypt}
                      onCheckedChange={(checked) => setFormData({ ...formData, encrypt: checked })}
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
                      checked={formData.trustServerCertificate}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, trustServerCertificate: checked })
                      }
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-offset-2 data-[checked]:bg-gray-900 dark:data-[checked]:bg-gray-100 data-[unchecked]:bg-gray-300 dark:data-[unchecked]:bg-gray-600"
                    >
                      <Switch.Thumb className="inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-900 transition-transform data-[checked]:translate-x-6 data-[unchecked]:translate-x-1" />
                    </Switch.Root>
                  </Field.Root>

                  <Field.Root className="flex items-center justify-between">
                    <Field.Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('sqlSettings.active')}
                    </Field.Label>
                    <Switch.Root
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-offset-2 data-[checked]:bg-gray-900 dark:data-[checked]:bg-gray-100 data-[unchecked]:bg-gray-300 dark:data-[unchecked]:bg-gray-600"
                    >
                      <Switch.Thumb className="inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-900 transition-transform data-[checked]:translate-x-6 data-[unchecked]:translate-x-1" />
                    </Switch.Root>
                  </Field.Root>
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded-lg flex items-start gap-2 ${
                      testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
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
                    onClick={handleTest}
                    disabled={isTesting}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isTesting ? t('sqlSettings.testing') : t('sqlSettings.testConnection')}
                  </Button>
                  <div className="flex-1" />
                  <Dialog.Close className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    {t('sqlSettings.cancel')}
                  </Dialog.Close>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? t('sqlSettings.saving')
                      : editingId
                        ? t('sqlSettings.update')
                        : t('sqlSettings.create')}
                  </Button>
                </div>
              </form>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
