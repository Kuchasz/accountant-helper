import { Button } from '@base-ui/react/button';
import { Dialog } from '@base-ui/react/dialog';
import { Field } from '@base-ui/react/field';
import { Input } from '@base-ui/react/input';
import { Switch } from '@base-ui/react/switch';
import { CheckCircle, Database, PencilSimple, Plus, Trash, XCircle } from '@phosphor-icons/react';
import { useState } from 'react';
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
      setTestResult({ success: false, message: 'Connection test failed' });
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
    if (confirm('Are you sure you want to delete this connection?')) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SQL Server Settings</h1>
          <p className="text-gray-600 mt-1">Manage Comarch Optima database connections</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors border-0 cursor-pointer"
        >
          <Plus size={20} />
          Add Connection
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading connections...</div>
      ) : connections.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Database size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No connections configured</h3>
          <p className="text-gray-600 mb-4">Add your first SQL Server connection to get started</p>
          <Button
            onClick={() => handleOpenDialog()}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors border-0 cursor-pointer"
          >
            Add Connection
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Server
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Database
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {connections.map((connection: (typeof connections)[0]) => (
                <tr key={connection.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {connection.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {connection.server}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {connection.database}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        connection.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {connection.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        onClick={() => handleOpenDialog(connection)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded border-0 cursor-pointer bg-transparent"
                        aria-label="Edit"
                      >
                        <PencilSimple size={18} />
                      </Button>
                      <Button
                        onClick={() => handleDelete(connection.id)}
                        className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded border-0 cursor-pointer bg-transparent"
                        aria-label="Delete"
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
          <Dialog.Popup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <Dialog.Title className="text-xl font-semibold text-gray-900 mb-4">
                {editingId ? 'Edit Connection' : 'Add New Connection'}
              </Dialog.Title>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Field.Root>
                  <Field.Label className="block text-sm font-medium text-gray-700 mb-1">
                    Connection Name
                  </Field.Label>
                  <Field.Control
                    render={(props) => (
                      <Input
                        {...props}
                        type="text"
                        required
                        value={formData.name}
                        onValueChange={(value) => setFormData({ ...formData, name: value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="e.g., Production Config DB"
                      />
                    )}
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </Field.Label>
                  <Field.Control
                    render={(props) => (
                      <select
                        {...props}
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({ ...formData, type: e.target.value as 'config' | 'company' })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      >
                        <option value="config">Configuration Database</option>
                        <option value="company">Company Database</option>
                      </select>
                    )}
                  />
                </Field.Root>

                <div className="grid grid-cols-2 gap-4">
                  <Field.Root>
                    <Field.Label className="block text-sm font-medium text-gray-700 mb-1">
                      Server
                    </Field.Label>
                    <Field.Control
                      render={(props) => (
                        <Input
                          {...props}
                          type="text"
                          required
                          value={formData.server}
                          onValueChange={(value) => setFormData({ ...formData, server: value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          placeholder="localhost or IP address"
                        />
                      )}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label className="block text-sm font-medium text-gray-700 mb-1">
                      Port
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                      )}
                    />
                  </Field.Root>
                </div>

                <Field.Root>
                  <Field.Label className="block text-sm font-medium text-gray-700 mb-1">
                    Database
                  </Field.Label>
                  <Field.Control
                    render={(props) => (
                      <Input
                        {...props}
                        type="text"
                        required
                        value={formData.database}
                        onValueChange={(value) => setFormData({ ...formData, database: value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="Database name"
                      />
                    )}
                  />
                </Field.Root>

                <div className="grid grid-cols-2 gap-4">
                  <Field.Root>
                    <Field.Label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </Field.Label>
                    <Field.Control
                      render={(props) => (
                        <Input
                          {...props}
                          type="text"
                          required
                          value={formData.username}
                          onValueChange={(value) => setFormData({ ...formData, username: value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                      )}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </Field.Label>
                    <Field.Control
                      render={(props) => (
                        <Input
                          {...props}
                          type="password"
                          required
                          value={formData.password}
                          onValueChange={(value) => setFormData({ ...formData, password: value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                      )}
                    />
                  </Field.Root>
                </div>

                <div className="space-y-3 pt-2">
                  <Field.Root className="flex items-center justify-between">
                    <Field.Label className="text-sm font-medium text-gray-700">
                      Encrypt Connection
                    </Field.Label>
                    <Switch.Root
                      checked={formData.encrypt}
                      onCheckedChange={(checked) => setFormData({ ...formData, encrypt: checked })}
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 data-[checked]:bg-gray-900 data-[unchecked]:bg-gray-300"
                    >
                      <Switch.Thumb className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform data-[checked]:translate-x-6 data-[unchecked]:translate-x-1" />
                    </Switch.Root>
                  </Field.Root>

                  <Field.Root className="flex items-center justify-between">
                    <Field.Label className="text-sm font-medium text-gray-700">
                      Trust Server Certificate
                    </Field.Label>
                    <Switch.Root
                      checked={formData.trustServerCertificate}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, trustServerCertificate: checked })
                      }
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 data-[checked]:bg-gray-900 data-[unchecked]:bg-gray-300"
                    >
                      <Switch.Thumb className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform data-[checked]:translate-x-6 data-[unchecked]:translate-x-1" />
                    </Switch.Root>
                  </Field.Root>

                  <Field.Root className="flex items-center justify-between">
                    <Field.Label className="text-sm font-medium text-gray-700">Active</Field.Label>
                    <Switch.Root
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 data-[checked]:bg-gray-900 data-[unchecked]:bg-gray-300"
                    >
                      <Switch.Thumb className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform data-[checked]:translate-x-6 data-[unchecked]:translate-x-1" />
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

                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    onClick={handleTest}
                    disabled={isTesting}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isTesting ? 'Testing...' : 'Test Connection'}
                  </Button>
                  <div className="flex-1" />
                  <Dialog.Close className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    Cancel
                  </Dialog.Close>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? 'Saving...'
                      : editingId
                        ? 'Update'
                        : 'Create'}
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
