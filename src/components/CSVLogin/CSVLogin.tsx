// CSVLogin.tsx
import React, { useState, FormEvent } from 'react';
import { TextInput, Button } from '@tremor/react';

interface LoginProps {
  onLoginSuccess: () => void;
}

const CSVLogin: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const validateLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (username === import.meta.env['VITE_CSV_LOGIN_USERNAME'] && password === import.meta.env['VITE_CSV_LOGIN_PASSWORD']) {
      onLoginSuccess();
    } else {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div className="flex h-screen justify-center items-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <form onSubmit={validateLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <TextInput
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <TextInput
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div>
            <Button type="submit" className="w-full">
              Log in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CSVLogin;
