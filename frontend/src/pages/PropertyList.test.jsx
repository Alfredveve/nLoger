import {render, screen, waitFor} from '@testing-library/react';
import {BrowserRouter} from 'react-router-dom';
import {
    describe,
    it,
    expect,
    vi,
    beforeEach
} from 'vitest';
import PropertyList from './Properties';

// Mock Components
vi.mock('../components/PropertyMap', () => ({
    default: () => <div data-testid="property-map">Property Map Mock</div>
}));

vi.mock('../components/PropertyCard', () => ({
    default: ({property}) => <div data-testid="property-card">{property.title}</div>
}));

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
vi.mock('../api/axios', () => ({
    default: {
        get: vi.fn(),
        getUri: vi.fn().mockReturnValue('http://localhost:8000/api/')
    }
}));

import api from '../api/axios';

describe('PropertyList Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders property list page', async () => {
        api.get.mockResolvedValue({
            data: []
        });

        render (
            <BrowserRouter>
                <PropertyList/>
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Tous les logements/i)).toBeInTheDocument();
        });
    });

    it('displays loading state', () => {
        api.get.mockReturnValue(new Promise(() => {})); // Never resolves

        render (
            <BrowserRouter>
                <PropertyList/>
            </BrowserRouter>
        );

        // Should show loading indicator (match "Chargement" from the component)
        expect(screen.getByText(/Chargement/i)).toBeInTheDocument();
    });

    it('displays properties when loaded', async () => {
        const mockProperties = [
            {
                id: 1,
                title: 'Bel Appartement',
                price: 5000000,
                property_type: 'APPARTEMENT',
                secteur_name: 'Almamya',
                images: []
            }, {
                id: 2,
                title: 'Villa Moderne',
                price: 10000000,
                property_type: 'VILLA',
                secteur_name: 'Kaloum',
                images: []
            }
        ];

        // Mock two successful calls: one for properties, one for regions
        api.get.mockResolvedValueOnce({ data: mockProperties });
        api.get.mockResolvedValueOnce({ data: [] });

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

        await waitFor(() => { // Should show error message containing the error
            expect(screen.getByText(/Erreur/i)).toBeInTheDocument();
        });
    });
});
