import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import MandateDashboard from './MandateDashboard';

// Mock Auth Context
const mockUser = {
  id: 1,
  username: 'testuser',
  is_proprietaire: true,
  is_demarcheur: false,
  phone: '600000000'
};

const mockAuth = {
  user: mockUser,
  loading: false
};

// Mock API
const mockMandates = [
  {
    id: 1,
    property_type: 'APPARTEMENT',
    property_type_display: 'Appartement',
    status: 'PENDING',
    status_display: 'En attente',
    location_description: 'Test Location',
    property_description: 'Test Description',
    expected_price: '1000000.00',
    owner: 1,
    owner_username: 'testuser',
    mandate_type: 'SIMPLE',
    mandate_type_display: 'Simple',
    commission_percentage: '10.00',
    signature_owner: null,
    signature_agent: null
  }
];

// Mock Modules
vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuth
}));

vi.mock('../api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

import api from '../api/axios';

describe('MandateDashboard', () => {
    beforeEach(() => {
        api.get.mockResolvedValue({ data: mockMandates });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

  it('renders correctly and fetches mandates', async () => {
    render(
      <BrowserRouter>
        <MandateDashboard />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Vos Mandats')).toBeInTheDocument();
    await waitFor(() => {
        expect(screen.getByText('Test Location')).toBeInTheDocument();
    });
  });

  it('shows sign button for owner if not signed', async () => {
    render(
      <BrowserRouter>
        <MandateDashboard />
      </BrowserRouter>
    );
    
    await waitFor(() => {
        expect(screen.getByText('Signer & Valider (Simple)')).toBeInTheDocument();
    });
  });

  it('opens create modal on click', async () => {
    render(
      <BrowserRouter>
        <MandateDashboard />
      </BrowserRouter>
    );
    
    const createBtn = screen.getByText('Nouveau Mandat');
    fireEvent.click(createBtn);
    
    expect(screen.getByText('Nouveau Mandat de Gestion')).toBeInTheDocument();
  });
});
