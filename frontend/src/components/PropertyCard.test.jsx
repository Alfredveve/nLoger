import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import PropertyCard from './PropertyCard';

const mockProperty = {
  id: 1,
  title: 'Belle Villa',
  description: 'Une magnifique villa avec jardin.',
  price: 5000000,
  property_type: 'APPARTEMENT',
  secteur_name: 'Ratoma',
  is_available: true,
};

describe('PropertyCard Component', () => {
  it('renders property details information', () => {
    render(
      <BrowserRouter>
        <PropertyCard property={mockProperty} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Belle Villa')).toBeInTheDocument();
    expect(screen.getByText('Une magnifique villa avec jardin.')).toBeInTheDocument();
    // Use regex to match 5,000,000 or 5 000 000 or 5.000.000
    expect(screen.getByText(/5[., ]000[., ]000/)).toBeInTheDocument();
    expect(screen.getByText('GNF')).toBeInTheDocument();
    expect(screen.getByText('Ratoma')).toBeInTheDocument();
  });

  it('renders the correct property type label', () => {
    render(
      <BrowserRouter>
        <PropertyCard property={mockProperty} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Appartement')).toBeInTheDocument();
  });
});
