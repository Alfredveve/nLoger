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

  it('successfully submits the form with valid data', async () => {
    api.post.mockResolvedValue({ data: { id: 100 } });
    api.get.mockImplementation((url) => {
      if (url === 'regions/') return Promise.resolve({ data: [{ id: '1', name: 'Conakry' }] });
      if (url === 'prefectures/') return Promise.resolve({ data: [{ id: '2', name: 'Kaloum' }] });
      if (url === 'secteurs/') return Promise.resolve({ data: [{ id: '3', name: 'Almamya' }] });
      return Promise.resolve({ data: [] });
    });
    
    render(
      <BrowserRouter>
        <AddProperty />
      </BrowserRouter>
    );

    // Wait for regions to load
    await waitFor(() => expect(screen.getByText('Conakry')).toBeInTheDocument());

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Ex: Bel appartement 3 pièces à Kaloum'), {
      target: { value: 'Magnifique Appartement 4 pièces' },
    });
    fireEvent.change(screen.getByPlaceholderText('Décrivez les caractéristiques du logement...'), {
      target: { value: 'Un très bel appartement situé au coeur du centre ville avec toutes les commodités.' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ex: 1500000'), {
      target: { value: '2500000' },
    });

    // Select region and wait for prefectures
    fireEvent.change(screen.getByLabelText('Région'), { target: { value: '1' } });
    await waitFor(() => expect(screen.getByText('Kaloum')).toBeInTheDocument());

    // Select prefecture and wait for secteurs
    fireEvent.change(screen.getByLabelText('Préfecture'), { target: { value: '2' } });
    await waitFor(() => expect(screen.getByText('Almamya')).toBeInTheDocument());

    // Select secteur
    fireEvent.change(screen.getByLabelText('Secteur'), { target: { value: '3' } });
    
    const submitButton = screen.getByText('Publier mon annonce');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      expect(screen.getByText('Logement publié avec succès !')).toBeInTheDocument();
    });
  });
});
