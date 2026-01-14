import {
    render,
    screen,
    fireEvent,
    waitFor,
    act
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {BrowserRouter} from 'react-router-dom';
import {
    describe,
    it,
    expect,
    vi,
    beforeEach
} from 'vitest';
import AddProperty from './AddProperty';
import api from '../api/axios';

// Mock the API module
vi.mock('../api/axios', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn()
    }
}));

describe('AddProperty Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default mocks
        api.get.mockResolvedValue({data: []});
    });

    it('shows validation errors for empty fields', async () => {
        render (<BrowserRouter>
            <AddProperty/>
        </BrowserRouter>);

        const submitButton = screen.getByText('Publier mon annonce');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Le titre doit faire au moins 5 caractères')).toBeInTheDocument();
            expect(screen.getByText('La description doit faire au moins 20 caractères')).toBeInTheDocument();
            expect(screen.getByText('Le prix doit être positif')).toBeInTheDocument();
        });
    });

    it('successfully submits the form with valid data', async () => {
        const user = userEvent.setup();

        api.post.mockResolvedValue({
            data: {
                id: 100
            }
        });

        api.get.mockImplementation((url) => {
            const urlStr = (typeof url === 'string') ? url : (url && url.url) || '';
            if (urlStr.includes('sous-prefectures')) 
                return Promise.resolve({
                    data: [
                        {
                            id: '4',
                            name: 'Kaloum Centre'
                        }
                    ]
                });
            
            if (urlStr.includes('prefectures')) 
                return Promise.resolve({
                    data: [
                        {
                            id: '2',
                            name: 'Kaloum'
                        }
                    ]
                });
            
            if (urlStr.includes('regions')) 
                return Promise.resolve({
                    data: [
                        {
                            id: '1',
                            name: 'Conakry'
                        }
                    ]
                });
            
            if (urlStr.includes('villes')) 
                return Promise.resolve({
                    data: [
                        {
                            id: '5',
                            name: 'Kaloum Ville'
                        }
                    ]
                });
            
            if (urlStr.includes('quartiers')) 
                return Promise.resolve({
                    data: [
                        {
                            id: '6',
                            name: 'Boulbinet'
                        }
                    ]
                });
            
            if (urlStr.includes('secteurs')) 
                return Promise.resolve({
                    data: [
                        {
                            id: '3',
                            name: 'Almamya'
                        }
                    ]
                });
            
            return Promise.resolve({data: []});
        });

        render (<BrowserRouter>
            <AddProperty/>
        </BrowserRouter>);

        // 1. Fill Basic Info
        await user.type(screen.getByPlaceholderText(/Ex: Bel appartement/), 'Magnifique Appartement');
        await user.type(screen.getByPlaceholderText(/Décrivez les caractéristiques/), 'Un très bel appartement situé au coeur du centre ville.');
        await user.type(screen.getByPlaceholderText(/1500000/), '2500000');

        // 2. Hierarchy Selection
        // Region
        await user.selectOptions(screen.getByLabelText('Région'), '1');
        expect(await screen.findByText('Kaloum')).toBeInTheDocument();

        // Prefecture
        await user.selectOptions(screen.getByLabelText('Préfecture'), '2');
        expect(await screen.findByText('Kaloum Centre')).toBeInTheDocument();

        // Sous-Prefecture
        await user.selectOptions(screen.getByLabelText('Sous-Préfecture'), '4');
        expect(await screen.findByText('Kaloum Ville')).toBeInTheDocument();

        // Ville
        await user.selectOptions(screen.getByLabelText('Ville / Commune'), '5');
        expect(await screen.findByText('Boulbinet')).toBeInTheDocument();

        // Quartier
        await user.selectOptions(screen.getByLabelText('Quartier'), '6');
        expect(await screen.findByText('Almamya')).toBeInTheDocument();

        // Secteur
        await user.selectOptions(screen.getByLabelText('Secteur'), '3');

        // 3. Fill Point de repère (Mandatory)
        await user.type(screen.getByPlaceholderText(/Ex: À 50m de la Mosquée/), 'À côté du Palais du Peuple');

        // 4. Submit
        const submitButton = screen.getByText('Publier mon annonce');
        await user.click(submitButton);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalled();
            expect(screen.getByText('Logement publié avec succès !')).toBeInTheDocument();
        });
    });
});
