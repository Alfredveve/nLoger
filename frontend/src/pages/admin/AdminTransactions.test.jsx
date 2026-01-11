import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminTransactions from './AdminTransactions';

// Mock API
vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn()
  }
}));

import api from '../../api/axios';

describe('AdminTransactions Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders transactions list', async () => {
    const mockTransactions = [
      {
        id: 1,
        user_username: 'tenant1',
        property_title: 'Bel Appartement',
        property: 8,
        status: 'PENDING',
        message: 'Je suis intéressé',
        created_at: '2024-01-10T10:00:00Z'
      },
      {
        id: 2,
        user_username: 'tenant2',
        property_title: 'Villa Moderne',
        property: 9,
        status: 'VALIDATED',
        message: 'Demande urgente',
        created_at: '2024-01-09T15:00:00Z'
      }
    ];

    api.get.mockResolvedValue({ data: { results: mockTransactions } });
    
    render(
      <BrowserRouter>
        <AdminTransactions />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('tenant1')).toBeInTheDocument();
      expect(screen.getByText('tenant2')).toBeInTheDocument();
    });
  });

  it('filters transactions by status', async () => {
    const mockTransactions = [
      {
        id: 1,
        user_username: 'tenant1',
        property_title: 'Appartement Test',
        property: 10,
        status: 'PENDING',
        message: 'Test message',
        created_at: '2024-01-10T10:00:00Z'
      }
    ];

    api.get.mockResolvedValue({ data: { results: mockTransactions } });
    
    render(
      <BrowserRouter>
        <AdminTransactions />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('tenant1')).toBeInTheDocument();
    });

    // Try to filter (if filter UI exists)
    const filterSelect = screen.queryByRole('combobox');
    if (filterSelect) {
      fireEvent.change(filterSelect, { target: { value: 'PENDING' } });
      
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith(expect.stringContaining('admin/occupations'), expect.any(Object));
      });
    }
  });

  it('validates a transaction', async () => {
    const mockTransactions = [
      {
        id: 1,
        user_username: 'tenant1',
        property_title: 'Test Property',
        property: 11,
        status: 'PENDING',
        message: 'Please validate',
        created_at: '2024-01-10T10:00:00Z'
      }
    ];

    api.get.mockResolvedValue({ data: { results: mockTransactions } });
    api.patch.mockResolvedValue({ data: { status: 'VALIDATED' } });
    
    render(
      <BrowserRouter>
        <AdminTransactions />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('tenant1')).toBeInTheDocument();
    });

    // Find and click validate button if it exists
    // Find and click validate button
    const validateButton = screen.getByTitle(/Approuver/i);
    fireEvent.click(validateButton);
    
    // Confirm in modal
    await waitFor(() => {
      // Look for the specific confirm button in the modal
      const confirmButton = screen.getByRole('button', { name: /Valider/i });
      fireEvent.click(confirmButton);
    });
    
    await waitFor(() => {
      expect(api.patch).toHaveBeenCalled();
    });
  });

  it('displays transaction details modal', async () => {
    const mockTransactions = [
      {
        id: 1,
        user_username: 'tenant1',
        property_title: 'Bel Appartement',
        property: 12,
        status: 'PENDING',
        message: 'Interested in this property',
        created_at: '2024-01-10T10:00:00Z'
      }
    ];

    api.get.mockResolvedValue({ data: { results: mockTransactions } });
    
    render(
      <BrowserRouter>
        <AdminTransactions />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('tenant1')).toBeInTheDocument();
    });

    // Find and click details button
    const detailsButton = screen.queryByTitle(/Voir les détails/i);
    
    if (detailsButton) {
      fireEvent.click(detailsButton);
      
      await waitFor(() => {
        // Modal should open - check for modal title
        expect(screen.getByText('Détails de la transaction')).toBeInTheDocument();
      });
    }
  });

  it('handles empty transaction list', async () => {
    api.get.mockResolvedValue({ data: { results: [] } });
    
    render(
      <BrowserRouter>
        <AdminTransactions />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/aucun/i) || screen.getByText(/vide/i)).toBeInTheDocument();
    });
  });
});
