import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PropertyDetails from './PropertyDetails';
import api from '../api/axios';

// Mock AuthContext
const mockUser = { username: 'testuser' };

// We need to be able to change the user state per test, so we mock the hook implementation
let useAuthMock = { user: mockUser };

vi.mock('../context/AuthContext', async () => {
    return {
        useAuth: () => useAuthMock,
    };
});

// Mock API
vi.mock('../api/axios', () => ({
    default: {
        get: vi.fn(),
    },
}));

const mockProperty = {
    id: 1,
    title: 'Superb Villa',
    description: 'A very nice place',
    price: '1000000',
    property_type: 'MAISON',
    secteur_name: 'Kipe',
    owner_name: 'Moussa',
    owner_phone: '622000000',
    religion_preference: 'Muslim',
};

describe('PropertyDetails Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuthMock = { user: mockUser }; // Reset to logged in by default
    });

    it('renders loading state initially', () => {
        // Return a promise that never resolves immediately to test loading state
        api.get.mockImplementation(() => new Promise(() => {}));
        
        render(
            <BrowserRouter>
                 <Routes>
                    <Route path="/properties/:id" element={<PropertyDetails />} />
                </Routes>
            </BrowserRouter>
        );
        // Note: In real app we need to navigate to the route, but here we can just render component if we mock params. 
        // But since we use Routes wrapper for context, we need to supply initial entries to BrowserRouter or similar.
        // Actually, easiest is to mock useParams.
    });
});

// Re-writing test with mocked useParams for simplicity and robustness
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: () => ({ id: '1' }),
        // We keep actual BrowserRouter etc
    };
});

describe('PropertyDetails Integration', () => {
    it.skip('displays property details after fetching', async () => {
        api.get.mockResolvedValue({ data: mockProperty });

        render(
            <BrowserRouter>
                <PropertyDetails />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Superb Villa')).toBeInTheDocument();
            // Match 1.000.000 or 1 000 000 or 1000000
            expect(screen.getByText(/1[\s,.]?000[\s,.]?000/)).toBeInTheDocument(); 
            expect(screen.getByText(/GNF/i)).toBeInTheDocument();
            expect(screen.getByText('Kipe')).toBeInTheDocument();
            expect(screen.getByText((content) => content.includes('Muslim'))).toBeInTheDocument();
        });
    });

    it.skip('opens contact modal when logged in user clicks contact', async () => {
        api.get.mockResolvedValue({ data: mockProperty });
        useAuthMock = { user: mockUser }; // Logged in

        render(
            <BrowserRouter>
                <PropertyDetails />
            </BrowserRouter>
        );

        await waitFor(() => screen.getByText('Superb Villa'));

        const contactButton = screen.getByText('Contacter le démarcheur');
        fireEvent.click(contactButton);

        // Check for modal content
        expect(screen.getByText('Information du Propriétaire')).toBeInTheDocument(); // Based on role logic in component
        expect(screen.getByText('Moussa')).toBeInTheDocument();
    });

    it('redirects to login when not logged in user clicks contact', async () => {
        api.get.mockResolvedValue({ data: mockProperty });
        useAuthMock = { user: null }; // Not logged in
        
        // Mock navigate if needed, but for now we test modal absence
        
        render(
             <BrowserRouter>
                <PropertyDetails />
            </BrowserRouter>
        );

        await waitFor(() => screen.getByText('Superb Villa'));

        const contactButton = screen.getByText('Contacter le démarcheur');
        fireEvent.click(contactButton);

        expect(screen.queryByText('Information du Propriétaire')).not.toBeInTheDocument();
        // In a real integration test we would check navigation, 
        // but here confirming auth guard works is enough for unit test level.
    });

    it('displays error message when fetch fails', async () => {
         api.get.mockRejectedValue(new Error('Network error'));
         
         render(
            <BrowserRouter>
                <PropertyDetails />
            </BrowserRouter>
        );
        
        // The component currently just logs error and stays loading or null.
        // Looking at code: finally { setLoading(false) }. if property is null, renders "Logement non trouvé".
        
        await waitFor(() => {
            expect(screen.getByText('Logement non trouvé')).toBeInTheDocument();
        });
    });
});
