import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EscrowStatus from './EscrowStatus';

const mockEscrow = {
  status: 'HOLDING',
  status_display: 'Fonds retenus',
  held_amount: 1500000,
  held_at: '2026-01-09T05:00:00Z',
  release_scheduled_date: '2026-01-16T05:00:00Z',
};

const mockPayment = {
  id: 'pay-123456789',
  payment_method_display: 'Orange Money',
  status_display: 'Retenu en séquestre',
};

describe('EscrowStatus Component', () => {
  it('renders HOLDING status correctly', () => {
    render(<EscrowStatus escrow={mockEscrow} payment={mockPayment} />);
    
    expect(screen.getByText('Statut Escrow')).toBeInTheDocument();
    expect(screen.getByText('Fonds retenus')).toBeInTheDocument();
    expect(screen.getByText(/1[\s,.]?500[\s,.]?000/)).toBeInTheDocument();
    expect(screen.getByText('Libération prévue')).toBeInTheDocument();
  });

  it('renders RELEASED status correctly', () => {
    const releasedEscrow = {
      ...mockEscrow,
      status: 'RELEASED',
      status_display: 'Fonds libérés',
      released_at: '2026-01-10T10:00:00Z',
    };

    render(<EscrowStatus escrow={releasedEscrow} payment={mockPayment} />);
    
    const timelineItems = screen.getAllByText('Fonds libérés');
    expect(timelineItems.length).toBeGreaterThan(0);
  });

  it('renders REFUNDED status correctly', () => {
    const refundedEscrow = {
      ...mockEscrow,
      status: 'REFUNDED',
      status_display: 'Remboursé',
      released_at: '2026-01-10T10:00:00Z',
      refund_reason: 'Problème de plomberie non déclaré',
    };

    render(<EscrowStatus escrow={refundedEscrow} payment={mockPayment} />);
    
    expect(screen.getByText('Raison du remboursement')).toBeInTheDocument();
    expect(screen.getByText('Fonds remboursés')).toBeInTheDocument();
    expect(screen.getByText('Problème de plomberie non déclaré')).toBeInTheDocument();
  });
});
