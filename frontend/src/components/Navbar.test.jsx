import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Navbar from './Navbar';

// Mock Auth context to prevent errors
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: null, 
    logout: vi.fn()
  })
}));

describe('Navbar Component', () => {
  it('renders the logo and navigation items', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    
    // Check Logo
    const logo = screen.getByAltText('NLoger Logo');
    expect(logo).toBeInTheDocument();
    
    // Check Brand Name using looser match or role
    expect(screen.getByText(/NLoger/i)).toBeInTheDocument();

    // Check Links (desktop)
    // Note: They might be hidden on mobile, but JSDOM usually renders them. 
    // If hidden by class, they exist in DOM.
    expect(screen.getAllByText(/Accueil/i)[0]).toBeInTheDocument(); 
    expect(screen.getAllByText(/Logements/i)[0]).toBeInTheDocument();
    // 'Publier' hidden for guest
    // expect(screen.getAllByText(/Publier/i)[0]).toBeInTheDocument(); 
  });
});
