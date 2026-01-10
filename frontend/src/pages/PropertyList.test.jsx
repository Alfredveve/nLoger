import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {BrowserRouter} from 'react-router-dom';
import {
    describe,
    it,
    expect,
    vi,
    beforeEach
} from 'vitest';
import PropertyList from './Properties';

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
    useAuth: () => (
        {
            user: {
                id: 1,
                username: 'testuser'
            },
            token: 'fake-token'
        }
    )
}));

// Mock API
vi.mock('../api/api', () => ({
    default: {
        get: vi.fn()
    }
}));

import api from '../api/api';

describe('PropertyList Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders property list page', () => {
        api.get.mockResolvedValue({
            data: {
                results: []
            }
        });

        render (
            <BrowserRouter>
                <PropertyList/>
            </BrowserRouter>
        );

        expect(screen.getByText(/Logements/i)).toBeInTheDocument();
    });

    it('displays loading state', () => {
        api.get.mockImplementation(() => new Promise(() => {})); // Never resolves

        render (
            <BrowserRouter>
                <PropertyList/>
            </BrowserRouter>
        );

        // Should show loading indicator
        expect(screen.queryByText(/Chargement/i) || screen.queryByRole('progressbar')).toBeTruthy();
    });

    it('displays properties when loaded', async () => {
        const mockProperties = [
            {
                id: 1,
                title: 'Bel Appartement',
                price: 5000000,
                property_type: 'APPARTEMENT',
                secteur: {
                    name: 'Almamya'
                },
                images: []
            }, {
                id: 2,
                title: 'Villa Moderne',
                price: 10000000,
                property_type: 'VILLA',
                secteur: {
                    name: 'Kaloum'
                },
                images: []
            }
        ];

        api.get.mockResolvedValue({
            data: {
                results: mockProperties
            }
        });

        render (
            <BrowserRouter>
                <PropertyList/>
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Bel Appartement')).toBeInTheDocument();
            expect(screen.getByText('Villa Moderne')).toBeInTheDocument();
        });
    });

    it('handles API errors gracefully', async () => {
        api.get.mockRejectedValue(new Error('Network error'));

        render (
            <BrowserRouter>
                <PropertyList/>
            </BrowserRouter>
        );

        await waitFor(() => { // Should show error message or empty state
            expect(screen.queryByText(/erreur/i) || screen.queryByText(/aucun/i)).toBeTruthy();
        });
    });
});
