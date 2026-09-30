import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SitePasswordGate from '../components/SitePasswordGate';

describe('SitePasswordGate Component', () => {
  it('renders the Stepathon branding and password input', () => {
    render(<SitePasswordGate onUnlock={vi.fn()} />);

    expect(screen.getByText(/Participant Access Password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter event password...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enter Stepathon/i })).toBeInTheDocument();
  });

  it('shows an error message on invalid password and does not unlock', () => {
    const onUnlock = vi.fn();
    render(<SitePasswordGate onUnlock={onUnlock} />);

    const input = screen.getByPlaceholderText('Enter event password...');
    fireEvent.change(input, { target: { value: 'WRONGPASS' } });
    fireEvent.submit(screen.getByRole('button', { name: /Enter Stepathon/i }).closest('form')!);

    expect(screen.getByText(/Incorrect password/i)).toBeInTheDocument();
    expect(onUnlock).not.toHaveBeenCalled();
  });

  it('unlocks in participant mode when STEPATHON2026 is entered', () => {
    const onUnlock = vi.fn();
    render(<SitePasswordGate onUnlock={onUnlock} />);

    const input = screen.getByPlaceholderText('Enter event password...');
    fireEvent.change(input, { target: { value: 'STEPATHON2026' } });
    fireEvent.submit(screen.getByRole('button', { name: /Enter Stepathon/i }).closest('form')!);

    expect(onUnlock).toHaveBeenCalledWith(false);
  });

  it('unlocks in admin mode when host admin passcode is entered', () => {
    const onUnlock = vi.fn();
    render(<SitePasswordGate onUnlock={onUnlock} />);

    const input = screen.getByPlaceholderText('Enter event password...');
    fireEvent.change(input, { target: { value: 'AxGstepathon2026' } });
    fireEvent.submit(screen.getByRole('button', { name: /Enter Stepathon/i }).closest('form')!);

    expect(onUnlock).toHaveBeenCalledWith(true);
  });
});
