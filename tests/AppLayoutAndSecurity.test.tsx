import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '../App';
import { SITE_AUTH_STORAGE_KEY, SITE_ACCESS_PASSWORD } from '../constants';

describe('App Layout Hierarchy, Mobile Nav, & Admin Reset Security (Upgrades 1, 7, 8)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('hides Admin Reset button for regular participants and shows it only when Host Admin is unlocked (Upgrade 8)', () => {
    // Unlock as regular participant
    localStorage.setItem(SITE_AUTH_STORAGE_KEY, SITE_ACCESS_PASSWORD);
    render(<App />);

    // Accept Honor Code Modal
    const acceptBtn = screen.getByRole('button', { name: /I Understand/i });
    fireEvent.click(acceptBtn);

    // Regular participant should NOT see Admin Reset button in footer
    expect(screen.queryByRole('button', { name: /Admin Reset/i })).not.toBeInTheDocument();

    // Unlock Host Admin Panel with STEPATHONADMIN2026
    const adminPassInput = screen.getByPlaceholderText('Enter Passcode...');
    fireEvent.change(adminPassInput, { target: { value: 'STEPATHONADMIN2026' } });
    fireEvent.click(screen.getByRole('button', { name: /Unlock/i }));

    // Now Admin Reset button IS visible in footer
    expect(screen.getByRole('button', { name: /Admin Reset/i })).toBeInTheDocument();
  });

  it('places ParticipantStepLogger above HostAdminPanel on the Race Dashboard and provides a Log My Steps quick-jump button (Upgrade 1)', () => {
    localStorage.setItem(SITE_AUTH_STORAGE_KEY, SITE_ACCESS_PASSWORD);
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /I Understand/i }));

    // Quick-jump CTA button in Hero header
    const quickJumpBtn = screen.getByRole('button', { name: /Log My Steps/i });
    expect(quickJumpBtn).toBeInTheDocument();

    // Check DOM order: ParticipantStepLogger (#step-logger-section) appears BEFORE Host & Admin Portal
    const stepLoggerHeading = screen.getByText('Roster & Daily Step Logger');
    const hostAdminHeading = screen.getByText('Host & Admin Portal');

    const position = stepLoggerHeading.compareDocumentPosition(hostAdminHeading);
    // Node.DOCUMENT_POSITION_FOLLOWING (4) means hostAdminHeading follows stepLoggerHeading
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('applies compact 2-column mobile grid classes on navigation bar (Upgrade 7)', () => {
    localStorage.setItem(SITE_AUTH_STORAGE_KEY, SITE_ACCESS_PASSWORD);
    const { container } = render(<App />);

    const navEl = container.querySelector('nav');
    expect(navEl).not.toBeNull();
    expect(navEl?.className).toContain('grid-cols-2');
    expect(navEl?.className).toContain('sm:flex');
  });
});
