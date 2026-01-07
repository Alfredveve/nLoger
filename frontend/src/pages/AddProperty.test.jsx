import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddProperty from './AddProperty';
import api from '../api/axios';

// Mock the API module
vi.mock('../api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('AddProperty Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mocks for regions/prefectures/secteurs
    api.get.mockResolvedValue({ data: [] });
  });

  it('shows validation errors for empty fields', async () => {
    render(
      <BrowserRouter>
        <AddProperty />
      </BrowserRouter>
    );

    const submitButton = screen.getByText('Publier mon annonce');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Le titre doit faire au moins 5 caractères')).toBeInTheDocument();
      expect(screen.getByText('La description doit faire au moins 20 caractères')).toBeInTheDocument();
      expect(screen.getByText('Le prix doit être positif')).toBeInTheDocument();
    });
  });

  it.skip('successfully submits the form with valid data', async () => {
    api.post.mockResolvedValue({ data: { id: 100 } });
    api.get.mockImplementation((url) => {
      if (url.includes('regions')) return Promise.resolve({ data: [{ id: 1, name: 'Conakry' }] });
      if (url.includes('prefectures')) return Promise.resolve({ data: [{ id: 2, name: 'Kaloum' }] });
      if (url.includes('sous-prefectures')) return Promise.resolve({ data: [{ id: 4, name: 'Kaloum Centre' }] });
      if (url.includes('villes')) return Promise.resolve({ data: [{ id: 5, name: 'Kaloum Ville' }] });
      if (url.includes('quartiers')) return Promise.resolve({ data: [{ id: 6, name: 'Boulbinet' }] });
      if (url.includes('secteurs')) return Promise.resolve({ data: [{ id: 3, name: 'Almamya' }] });
      return Promise.resolve({ data: [] });
    });
    
    render(
      <BrowserRouter>
        <AddProperty />
      </BrowserRouter>
    );

    // Wait for regions
    await waitFor(() => expect(screen.getByText('Conakry')).toBeInTheDocument());

    // Fill Basic Info
    fireEvent.change(screen.getByPlaceholderText(/Ex: Bel appartement/), { target: { value: 'Magnifique Appartement' } });
    fireEvent.change(screen.getByPlaceholderText(/Décrivez les caractéristiques/), { target: { value: 'Un très bel appartement situé au coeur du centre ville.' } });
    fireEvent.change(screen.getByPlaceholderText(/1500000/), { target: { value: '2500000' } });

    // Hierarchy Selection
    // 1. Region
    fireEvent.change(screen.getByLabelText('Région'), { target: { value: '1' } });
    await waitFor(() => expect(screen.getByText('Kaloum')).toBeInTheDocument());

    // 2. Prefecture
    fireEvent.change(screen.getByLabelText('Préfecture'), { target: { value: '2' } });
    await waitFor(() => expect(screen.getByText('Kaloum Centre')).toBeInTheDocument());

    // 3. Sous-Prefecture
    fireEvent.change(screen.getByLabelText('Sous-Préfecture'), { target: { value: '4' } });
    await waitFor(() => expect(screen.getByText('Kaloum Ville')).toBeInTheDocument());

    // 4. Ville
    fireEvent.change(screen.getByLabelText('Ville / Commune'), { target: { value: '5' } });
    await waitFor(() => expect(screen.getByText('Boulbinet')).toBeInTheDocument());

    // 5. Quartier
    fireEvent.change(screen.getByLabelText('Quartier'), { target: { value: '6' } });
    await waitFor(() => expect(screen.getByText('Almamya')).toBeInTheDocument());

    // 6. Secteur
    fireEvent.change(screen.getByLabelText('Secteur'), { target: { value: '3' } });
    
    const submitButton = screen.getByText('Publier mon annonce');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      expect(screen.getByText('Logement publié avec succès !')).toBeInTheDocument();
    });
  });
});
