import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Settings from './Settings';
import '@testing-library/jest-dom';

const renderWithProviders = (ui) => {
  return render(
    <AuthProvider>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </AuthProvider>
  );
};

describe('Settings Component', () => {
  test('renders settings page title', () => {
    renderWithProviders(<Settings />);
    expect(screen.getByText(/Paramètres/i)).toBeInTheDocument();
  });

  test('renders password change section', () => {
    renderWithProviders(<Settings />);
    expect(screen.getByText(/Mot de passe & Sécurité/i)).toBeInTheDocument();
  });

  test('renders notifications section', () => {
    renderWithProviders(<Settings />);
    expect(screen.getByText(/Notifications/i)).toBeInTheDocument();
  });
});
