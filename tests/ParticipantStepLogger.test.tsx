import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ParticipantStepLogger from '../components/ParticipantStepLogger';
import { User, Team } from '../types';

const mockTeams: Team[] = [
  { id: 'team-1', name: 'Boba Walkers', color: '#4285F4', iconId: 'trophy' }
];

const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Alice Smith',
    teamId: 'team-1',
    teamName: 'Boba Walkers',
    steps: 10000,
    weeklySteps: { 1: 10000 },
    stepHistory: [
      { amount: 5000, date: '2026-07-10T12:00:00.000Z', week: 1 },
      { amount: 5000, date: '2026-07-09T12:00:00.000Z', week: 1 }
    ],
    iconId: 'smile'
  },
  {
    id: 'user-2',
    name: 'Bob Jones',
    teamId: '',
    teamName: '',
    steps: 0,
    weeklySteps: {},
    stepHistory: [],
    iconId: 'smile'
  }
];

describe('ParticipantStepLogger Component', () => {
  it('renders roster search and dropdown filters', () => {
    render(
      <ParticipantStepLogger
        users={mockUsers}
        teams={mockTeams}
        onAddSteps={vi.fn()}
        onDeleteStep={vi.fn()}
      />
    );

    expect(screen.getByPlaceholderText('Search participant...')).toBeInTheDocument();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
  });

  it('filters participants by search query', () => {
    render(
      <ParticipantStepLogger
        users={mockUsers}
        teams={mockTeams}
        onAddSteps={vi.fn()}
        onDeleteStep={vi.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search participant...');
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument();
  });

  it('opens step logging form when a participant is clicked', () => {
    render(
      <ParticipantStepLogger
        users={mockUsers}
        teams={mockTeams}
        onAddSteps={vi.fn()}
        onDeleteStep={vi.fn()}
      />
    );

    // Click on Alice Smith in roster list
    const participantRow = screen.getByText('Alice Smith');
    fireEvent.click(participantRow);

    // Form headers and inputs should render
    expect(screen.getByText('Current Miles:')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter steps (e.g. 5000)...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log steps/i })).toBeInTheDocument();
  });

  it('supports quick add preset step values', () => {
    render(
      <ParticipantStepLogger
        users={mockUsers}
        teams={mockTeams}
        onAddSteps={vi.fn()}
        onDeleteStep={vi.fn()}
      />
    );

    // Click on Alice Smith
    fireEvent.click(screen.getByText('Alice Smith'));

    const stepInput = screen.getByPlaceholderText('Enter steps (e.g. 5000)...') as HTMLInputElement;
    expect(stepInput.value).toBe('');

    // Click +2,000 preset button
    const presetBtn = screen.getByText('+2,000 (1 mi)');
    fireEvent.click(presetBtn);

    expect(stepInput.value).toBe('2000');
  });

  it('submits step entry and invokes onAddSteps', async () => {
    const onAddSteps = vi.fn();
    render(
      <ParticipantStepLogger
        users={mockUsers}
        teams={mockTeams}
        onAddSteps={onAddSteps}
        onDeleteStep={vi.fn()}
      />
    );

    // Click on Alice Smith
    fireEvent.click(screen.getByText('Alice Smith'));

    const stepInput = screen.getByPlaceholderText('Enter steps (e.g. 5000)...');

    fireEvent.change(stepInput, { target: { value: '7000' } });
    fireEvent.submit(screen.getByRole('button', { name: /log steps/i }).closest('form')!);

    await waitFor(() => {
      expect(onAddSteps).toHaveBeenCalledWith('user-1', 7000, 1, expect.any(String));
    });
  });

  it('validates date picker does not allow future dates', () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <ParticipantStepLogger
        users={mockUsers}
        teams={mockTeams}
        onAddSteps={vi.fn()}
        onDeleteStep={vi.fn()}
      />
    );

    // Click on Alice Smith
    fireEvent.click(screen.getByText('Alice Smith'));

    // Date picker input
    const dateInput = screen.getByTitle('Select date of steps (past or today only)') as HTMLInputElement;

    // Set future date (e.g., year 2050)
    fireEvent.change(dateInput, { target: { value: '2050-12-31' } });

    expect(alertMock).toHaveBeenCalledWith('You can only log steps for today or a past date.');
    expect(dateInput.value).not.toBe('2050-12-31');

    alertMock.mockRestore();
  });

  it('renders step history and handles deletion', () => {
    const onDeleteStep = vi.fn();
    render(
      <ParticipantStepLogger
        users={mockUsers}
        teams={mockTeams}
        onAddSteps={vi.fn()}
        onDeleteStep={onDeleteStep}
      />
    );

    // Click on Alice Smith
    fireEvent.click(screen.getByText('Alice Smith'));

    // History log list header
    expect(screen.getByText('Step History for Alice Smith')).toBeInTheDocument();

    // Verify history rows
    const deleteButtons = screen.getAllByTitle('Delete entry');
    expect(deleteButtons.length).toBe(2);

    // Click the first delete button (which is the most recent entry, reverse index 0 -> index 1 in original history array)
    fireEvent.click(deleteButtons[0]);

    expect(onDeleteStep).toHaveBeenCalledWith('user-1', 1);
  });
});
