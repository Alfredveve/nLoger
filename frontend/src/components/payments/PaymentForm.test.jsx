import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PaymentForm from './PaymentForm';
import * as paymentApi from '../../api/paymentApi';
import { toast } from 'react-hot-toast';

// Mock paymentApi
vi.mock('../../api/paymentApi', () => ({
  initiatePayment: vi.fn(),
  verifyPayment: vi.fn(),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const mockOccupationRequest = {
  id: 'occ-123',
  payment_amount: 1500000,
};

describe('PaymentForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with initial state', () => {
    render(<PaymentForm occupationRequest={mockOccupationRequest} />);
    
    expect(screen.getByText('Paiement Sécurisé')).toBeInTheDocument();
    expect(screen.getByText(/1[\s,.]?500[\s,.]?000/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ex: 622123456')).toBeInTheDocument();
  });

  it('validates phone number on submission', async () => {
    const { container } = render(<PaymentForm occupationRequest={mockOccupationRequest} />);
    const form = container.querySelector('form');
    
    fireEvent.submit(form);
    
    expect(toast.error).toHaveBeenCalledWith('Veuillez entrer un numéro de téléphone valide');
    expect(paymentApi.initiatePayment).not.toHaveBeenCalled();
  });

  it('calls initiatePayment and shows success state', async () => {
    paymentApi.initiatePayment.mockResolvedValue({
      success: true,
      message: 'Initialisation réussie',
      payment_id: 'pay-456',
      transaction_id: 'TX-789',
      ussd_code: '*144*4*6#',
    });

    render(<PaymentForm occupationRequest={mockOccupationRequest} />);
    
    const phoneInput = screen.getByPlaceholderText('Ex: 622123456');
    fireEvent.change(phoneInput, { target: { value: '622112233' } });
    
    const submitButton = screen.getByRole('button', { name: /Payer maintenant/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(paymentApi.initiatePayment).toHaveBeenCalledWith({
        occupation_request_id: 'occ-123',
        payment_method: 'ORANGE_MONEY',
        payment_phone: '622112233',
        save_payment_method: false,
      });
      expect(screen.getByText('Paiement Initié')).toBeInTheDocument();
      expect(screen.getByText('*144*4*6#')).toBeInTheDocument();
    });
  });

  it('switches payment methods', () => {
    render(<PaymentForm occupationRequest={mockOccupationRequest} />);
    
    const mtnButton = screen.getByRole('button', { name: /MTN Mobile Money/i });
    fireEvent.click(mtnButton);
    
    expect(screen.getByText('MTN Mobile Money')).toBeInTheDocument();
    // Check if the phone number label updated (indirectly by checking selected method)
    expect(screen.getByText(/Le numéro associé à votre compte MTN Mobile Money/i)).toBeInTheDocument();
  });
});
