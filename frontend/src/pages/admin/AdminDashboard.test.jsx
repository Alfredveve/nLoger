import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminDashboard from './AdminDashboard';

// Mock API
vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn()
  }
}));

import api from '../../api/axios';

describe('AdminDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    api.get.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
    
    expect(screen.getByRole('progressbar') || document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('displays dashboard statistics when loaded', async () => {
    const mockStats = {
      total_users: 150,
      total_properties: 75,
      total_mandates: 30,
      pending_kyc: 5
    };

    const mockAnalytics = {
      users_by_role: {
        demarcheurs: 20,
        proprietaires: 50,
        locataires: 80
      },
      properties_by_type: [
        { property_type: 'APPARTEMENT', count: 40 },
        { property_type: 'VILLA', count: 20 },
        { property_type: 'STUDIO', count: 15 }
      ]
    };

    api.get.mockImplementation((url) => {
      if (url.includes('stats')) {
        return Promise.resolve({ data: mockStats });
      }
      if (url.includes('analytics')) {
        return Promise.resolve({ data: mockAnalytics });
      }
    });
    
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Tableau de bord')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument(); // total users
      expect(screen.getByText('75')).toBeInTheDocument(); // total properties
    });
  });

  it('handles API errors gracefully', async () => {
    api.get.mockRejectedValue(new Error('Network error'));
    
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      // Should finish loading even with error
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('displays charts with analytics data', async () => {
    const mockStats = {
      total_users: 150,
      total_properties: 75,
      total_mandates: 30,
      pending_kyc: 5
    };

    const mockAnalytics = {
      users_by_role: {
        demarcheurs: 20,
        proprietaires: 50,
        locataires: 80
      },
      properties_by_type: [
        { property_type: 'APPARTEMENT', count: 40 },
        { property_type: 'VILLA', count: 20 }
      ]
    };

    api.get.mockImplementation((url) => {
      if (url.includes('stats')) {
        return Promise.resolve({ data: mockStats });
      }
      if (url.includes('analytics')) {
        return Promise.resolve({ data: mockAnalytics });
      }
    });
    
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Propriétés par Type')).toBeInTheDocument();
      expect(screen.getByText('Répartition des Utilisateurs')).toBeInTheDocument();
    });
  });
});
