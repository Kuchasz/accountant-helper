import { useState } from 'react';
import { trpc } from './lib/trpc';

export function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const helloQuery = trpc.hello.useQuery({ name: 'World' });
  const usersQuery = trpc.getUsers.useQuery();
  const createUserMutation = trpc.createUser.useMutation({
    onSuccess: () => {
      usersQuery.refetch();
      setName('');
      setEmail('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      createUserMutation.mutate({ name, email });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Optima Helper 2
          </h1>
          <p className="text-gray-600 mb-6">
            Vite + React + tRPC + Tailwind + TypeScript
          </p>

          {/* Hello World from tRPC */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-2">
              tRPC Hello World
            </h2>
            {helloQuery.isLoading ? (
              <p className="text-gray-600">Loading...</p>
            ) : helloQuery.error ? (
              <p className="text-red-600">Error: {helloQuery.error.message}</p>
            ) : (
              <div>
                <p className="text-lg text-blue-700 font-medium">
                  {helloQuery.data?.greeting}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {helloQuery.data?.timestamp}
                </p>
              </div>
            )}
          </div>

          {/* Create User Form */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-green-900 mb-4">
              Create User
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="john@example.com"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={createUserMutation.isPending}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createUserMutation.isPending ? 'Creating...' : 'Create User'}
              </button>
            </form>
          </div>

          {/* Users List */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-purple-900 mb-4">
              Users from Database
            </h2>
            {usersQuery.isLoading ? (
              <p className="text-gray-600">Loading users...</p>
            ) : usersQuery.error ? (
              <p className="text-red-600">Error: {usersQuery.error.message}</p>
            ) : usersQuery.data?.length === 0 ? (
              <p className="text-gray-600 italic">
                No users yet. Create one above!
              </p>
            ) : (
              <ul className="space-y-3">
                {usersQuery.data?.map((user) => (
                  <li
                    key={user.id}
                    className="bg-white p-4 rounded-md shadow-sm border border-purple-100"
                  >
                    <p className="font-medium text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      ID: {user.id} • Created:{' '}
                      {new Date(user.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <footer className="text-center text-gray-600 text-sm">
          <p>
            Built with Vite, React, tRPC, Express, Drizzle, SQLite, and
            Tailwind CSS
          </p>
        </footer>
      </div>
    </div>
  );
}
