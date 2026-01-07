import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Register from './Register';

// Mock AuthContext
const mockRegister = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('../context/AuthContext', async () => {
    return {
        useAuth: () => ({
            register: mockRegister,
        }),
    };
});

describe('Register Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        window.alert = vi.fn(); // Mock alert
    });

    it('renders registration form correctly', () => {
        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );

        expect(screen.getByLabelText(/Nom d'utilisateur/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Type de compte/i)).toBeInTheDocument();
    });

    it('shows document upload fields when Demarcheur role is selected', async () => {
        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );

        const roleSelect = screen.getByLabelText(/Type de compte/i);
        fireEvent.change(roleSelect, { target: { value: 'DEMARCHEUR' } });

        await waitFor(() => {
            expect(screen.getByText(/Documents requis/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Pièce d'identité/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Contrat signé/i)).toBeInTheDocument();
        });
    });

    it('handles successful registration for Locataire', async () => {
        mockRegister.mockResolvedValue({});

        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/Nom d'utilisateur/i), { target: { value: 'newuser' } });
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/Mot de passe/i), { target: { value: 'password123' } });
       
        const submitButton = screen.getByRole('button', { name: /S'inscrire/ });
        fireEvent.click(submitButton);

        await waitFor(() => {
             // Access the FormData object passed to the mock
             const formData = mockRegister.mock.calls[0][0];
             expect(formData.get('username')).toBe('newuser');
             expect(formData.get('email')).toBe('test@example.com');
             expect(formData.get('role')).toBe('LOCATAIRE');
             expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });

     it('handles successful registration for Demarcheur', async () => {
        mockRegister.mockResolvedValue({});

        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/Nom d'utilisateur/i), { target: { value: 'demarcheur1' } });
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'dem@example.com' } });
        fireEvent.change(screen.getByLabelText(/Mot de passe/i), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/^Prénom$/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/^Nom$/i), { target: { value: 'Doe' } });
        
        // Select Demarcheur role
        fireEvent.change(screen.getByLabelText(/Type de compte/i), { target: { value: 'DEMARCHEUR' } });
        
        // Mock file upload
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        
        // Need to wait for dynamic fields to appear
        await waitFor(() => expect(screen.getByLabelText(/Pièce d'identité/i)).toBeInTheDocument());

        const bioInput = screen.getByLabelText(/Pièce d'identité/i);
        const contractInput = screen.getByLabelText(/Contrat signé/i);

        fireEvent.change(bioInput, { target: { files: [file] } });
        fireEvent.change(contractInput, { target: { files: [file] } });

        const form = screen.getByLabelText('registration-form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalled();
        });

        const formDataPassed = mockRegister.mock.calls[0][0];
        expect(formDataPassed.get('role')).toBe('DEMARCHEUR');
        expect(formDataPassed.get('username')).toBe('demarcheur1');
        expect(window.alert).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
});
