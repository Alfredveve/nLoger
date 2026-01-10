import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import MyVisits from './MyVisits';

const mockUserVisitor = {
  id: 2,
  username: 'visitor',
  is_locataire: true,
  is_demarcheur: false
};

const mockVisits = [
    {
        id: 1,
        property_title: 'Maison Test',
        visitor: 2,
        visitor_username: 'visitor',
        agent_username: 'agent',
        status: 'ACCEPTED',
        status_display: 'En attente',
        validation_code: '123456',
        created_at: new Date().toISOString()
    }
];

// Mock Modules
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: mockUserVisitor, loading: false })
}));

vi.mock('../api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

import api from '../api/axios';

describe('MyVisits', () => {
    beforeEach(() => {
        api.get.mockResolvedValue({ data: mockVisits });
    });

  it('renders visits and shows code for visitor', async () => {
    render(
      <BrowserRouter>
        <MyVisits />
      </BrowserRouter>
    );

    expect(screen.getByText('Visites Sécurisées')).toBeInTheDocument();
    
    await waitFor(() => {
        expect(screen.getByText('Maison Test')).toBeInTheDocument();
        expect(screen.getByText('123456')).toBeInTheDocument(); // Code should be visible for visitor
    });
  });
});
