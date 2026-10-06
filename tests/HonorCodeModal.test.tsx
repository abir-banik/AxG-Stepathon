import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HonorCodeModal from '../components/HonorCodeModal';

describe('HonorCodeModal Component', () => {
  it('renders the Stepathon Honor Policy title, 1st FY27 branding, and #bigstepper rule', () => {
    render(<HonorCodeModal onAccept={vi.fn()} />);

    expect(screen.getByText('Stepathon Honor Policy')).toBeInTheDocument();
    expect(screen.getByText(/1st FY27 Global Stepathon/i)).toBeInTheDocument();
    expect(screen.getByText('Log Honest Steps Only')).toBeInTheDocument();
    expect(screen.getByText('Only Update Your Own Profile')).toBeInTheDocument();
    expect(screen.getByText(/Never log, edit, or delete steps on anyone else's profile/i)).toBeInTheDocument();
    expect(screen.getByText('30,000+ Daily Step Cap (#bigstepper)')).toBeInTheDocument();
    expect(screen.getAllByText(/#bigstepper/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Keep Your Tracker Proof')).toBeInTheDocument();
  });

  it('calls onAccept when the I Understand button is clicked', () => {
    const onAccept = vi.fn();
    render(<HonorCodeModal onAccept={onAccept} />);

    const acceptBtn = screen.getByRole('button', { name: /I Understand/i });
    fireEvent.click(acceptBtn);

    expect(onAccept).toHaveBeenCalledTimes(1);
  });
});
