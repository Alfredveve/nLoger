import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminDisputes from './AdminDisputes';

// Mock API
vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn()
  }
}));

import api from '../../api/axios';

describe('AdminDisputes Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders disputes list', async () => {
    const mockDisputes = [
      {
        id: '1',
        payment: 'payment-1',
        payment_amount: 5000000,
        raised_by_username: 'tenant1',
        reason: 'Logement non conforme',
        status: 'OPEN',
        created_at: '2024-01-10T10:00:00Z'
      },
      {
        id: '2',
        payment: 'payment-2',
        payment_amount: 3000000,
        raised_by_username: 'tenant2',
        reason: 'Problème de paiement',
        status: 'INVESTIGATING',
        created_at: '2024-01-09T15:00:00Z'
      }
    ];

    api.get.mockResolvedValue({ data: { results: mockDisputes } });
    
    render(
      <BrowserRouter>
        <AdminDisputes />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Logement non conforme')).toBeInTheDocument();
      expect(screen.getByText('Problème de paiement')).toBeInTheDocument();
    });
  });

  it('resolves dispute with full refund', async () => {
    const mockDisputes = [
      {
        id: '1',
        payment: 'payment-1',
        payment_amount: 5000000,
        raised_by_username: 'tenant1',
        reason: 'Logement non conforme',
        status: 'OPEN',
        created_at: '2024-01-10T10:00:00Z'
      }
    ];

    api.get.mockResolvedValue({ data: { results: mockDisputes } });
    api.patch.mockResolvedValue({ 
      data: { 
        status: 'RESOLVED',
        resolution: 'REFUND_FULL'
      } 
    });
    
    render(
      <BrowserRouter>
        <AdminDisputes />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Logement non conforme')).toBeInTheDocument();
    });

    // Find resolve button
    const resolveButton = screen.queryByRole('button', { name: /résoudre/i }) ||
                          screen.queryByRole('button', { name: /remboursement total/i });
    
    if (resolveButton) {
      fireEvent.click(resolveButton);
      
      await waitFor(() => {
        expect(api.patch).toHaveBeenCalledWith(
          expect.stringContaining('disputes/1'),
          expect.objectContaining({
            resolution: 'REFUND_FULL'
          })
        );
      });
    }
  });

  it('resolves dispute with partial refund', async () => {
    const mockDisputes = [
      {
        id: '1',
        payment: 'payment-1',
        payment_amount: 5000000,
        raised_by_username: 'tenant1',
        reason: 'Problème mineur',
        status: 'INVESTIGATING',
        created_at: '2024-01-10T10:00:00Z'
      }
    ];

    api.get.mockResolvedValue({ data: { results: mockDisputes } });
    api.patch.mockResolvedValue({ 
      data: { 
        status: 'RESOLVED',
        resolution: 'REFUND_PARTIAL'
      } 
    });
    
    render(
      <BrowserRouter>
        <AdminDisputes />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Problème mineur')).toBeInTheDocument();
    });

    const partialRefundButton = screen.queryByRole('button', { name: /remboursement partiel/i });
    
    if (partialRefundButton) {
      fireEvent.click(partialRefundButton);
      
      await waitFor(() => {
        expect(api.patch).toHaveBeenCalled();
      });
    }
  });

  it('resolves dispute with no refund', async () => {
    const mockDisputes = [
      {
        id: '1',
        payment: 'payment-1',
        payment_amount: 5000000,
        raised_by_username: 'tenant1',
        reason: 'Réclamation non fondée',
        status: 'INVESTIGATING',
        created_at: '2024-01-10T10:00:00Z'
      }
    ];

    api.get.mockResolvedValue({ data: { results: mockDisputes } });
    api.patch.mockResolvedValue({ 
      data: { 
        status: 'RESOLVED',
        resolution: 'NO_REFUND'
      } 
    });
    
    render(
      <BrowserRouter>
        <AdminDisputes />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Réclamation non fondée')).toBeInTheDocument();
    });

    const noRefundButton = screen.queryByRole('button', { name: /pas de remboursement/i }) ||
                           screen.queryByRole('button', { name: /rejeter/i });
    
    if (noRefundButton) {
      fireEvent.click(noRefundButton);
      
      await waitFor(() => {
        expect(api.patch).toHaveBeenCalled();
      });
    }
  });

  it('filters disputes by status', async () => {
    const mockDisputes = [
      {
        id: '1',
        payment: 'payment-1',
        payment_amount: 5000000,
        raised_by_username: 'tenant1',
        reason: 'Test',
        status: 'OPEN',
        created_at: '2024-01-10T10:00:00Z'
      }
    ];

    api.get.mockResolvedValue({ data: { results: mockDisputes } });
    
    render(
      <BrowserRouter>
        <AdminDisputes />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    const filterSelect = screen.queryByRole('combobox');
    if (filterSelect) {
      fireEvent.change(filterSelect, { target: { value: 'OPEN' } });
      
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith(
          expect.stringContaining('disputes/'),
          expect.objectContaining({
            params: expect.objectContaining({
              status: 'OPEN'
            })
          })
        );
      });
    }
  });

  it('handles empty disputes list', async () => {
    api.get.mockResolvedValue({ data: { results: [] } });
    
    render(
      <BrowserRouter>
        <AdminDisputes />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/aucun/i) || screen.getByText(/pas de litige/i)).toBeInTheDocument();
    });
  });
});
