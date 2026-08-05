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
      expect(onAddSteps).toHaveBeenCalledWith('user-1', 7000, expect.any(Number), expect.any(String));
    });
  });

  it('automatically calculates week from date input', async () => {
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

    const dateInput = screen.getByTitle('Select date of steps (July 13 to August 5 only)');
    const stepInput = screen.getByPlaceholderText('Enter steps (e.g. 5000)...');

    // Select date in Week 1 (July 13, 2026)
    fireEvent.change(dateInput, { target: { value: '2026-07-13' } });
    fireEvent.change(stepInput, { target: { value: '8000' } });

    fireEvent.submit(screen.getByRole('button', { name: /log steps/i }).closest('form')!);

    await waitFor(() => {
      expect(onAddSteps).toHaveBeenCalledWith('user-1', 8000, 1, '2026-07-13');
    });
  });

  it('validates date picker only allows dates from July 13th to August 5th', () => {
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
    const dateInput = screen.getByTitle('Select date of steps (July 13 to August 5 only)') as HTMLInputElement;

    // Test date before July 13th
    fireEvent.change(dateInput, { target: { value: '2026-07-10' } });
    expect(alertMock).toHaveBeenCalledWith('Steps can only be logged starting from July 13th, 2026.');
    expect(dateInput.value).not.toBe('2026-07-10');

    // Test date after August 5th
    fireEvent.change(dateInput, { target: { value: '2026-08-10' } });
    expect(alertMock).toHaveBeenCalledWith('Steps can only be logged up to August 5th, 2026.');
    expect(dateInput.value).not.toBe('2026-08-10');

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
    expect(screen.getByText(/Step History for Alice Smith/i)).toBeInTheDocument();

    // Verify history rows
    const deleteButtons = screen.getAllByTitle('Delete entry');
    expect(deleteButtons.length).toBe(2);

    // Click the first delete button (which is the most recent entry, original index 0 in mock date-desc history)
    fireEvent.click(deleteButtons[0]);

    expect(onDeleteStep).toHaveBeenCalledWith('user-1', 0);
  });

  it('filters by team and sorts roster alphabetically A-Z and Z-A', () => {
    render(
      <ParticipantStepLogger
        users={mockUsers}
        teams={mockTeams}
        onAddSteps={vi.fn()}
        onDeleteStep={vi.fn()}
      />
    );

    // Filter by team dropdown
    const teamDropdown = screen.getAllByRole('combobox')[0];
    expect(teamDropdown).toBeInTheDocument();

    // Sort order dropdown (A-Z default)
    const cardElements = screen.getAllByRole('button').map(b => b.textContent);
    expect(cardElements[0]).toContain('Alice Smith');
    expect(cardElements[1]).toContain('Bob Jones');

    // Change sort order to Z-A
    const sortDropdown = screen.getAllByRole('combobox')[1];
    fireEvent.change(sortDropdown, { target: { value: 'name-desc' } });

    const updatedCardElements = screen.getAllByRole('button').map(b => b.textContent);
    expect(updatedCardElements[0]).toContain('Bob Jones');
    expect(updatedCardElements[1]).toContain('Alice Smith');
  });

  it('supports sorting step history by Most Recent Date, Oldest Date, and Recently Updated', () => {
    const userWithMultiHistory: User = {
      id: 'user-sort',
      name: 'Sort User',
      teamId: 'team-1',
      teamName: 'Boba Walkers',
      steps: 100000,
      weeklySteps: { 3: 100000 },
      stepHistory: [
        { amount: 36281, date: '2026-07-30', week: 3, submittedAt: '2026-08-01T10:00:00.000Z' },
        { amount: 34117, date: '2026-08-01', week: 3, submittedAt: '2026-08-01T11:00:00.000Z' },
        { amount: 30491, date: '2026-08-02', week: 3, submittedAt: '2026-08-01T12:00:00.000Z' },
        { amount: 30015, date: '2026-08-03', week: 4, submittedAt: '2026-08-04T10:00:00.000Z' }
      ],
      iconId: 'smile'
    };

    render(
      <ParticipantStepLogger
        users={[userWithMultiHistory]}
        teams={mockTeams}
        onAddSteps={vi.fn()}
        onDeleteStep={vi.fn()}
      />
    );

    // Click on Sort User
    fireEvent.click(screen.getByText('Sort User'));

    // Step history sort dropdown
    const historySortSelect = screen.getByRole('combobox', { name: /sort step history/i });
    expect(historySortSelect).toBeInTheDocument();
    expect(historySortSelect).toHaveValue('date-desc');

    // Default: Date Most Recent First (Aug 3 -> Aug 2 -> Aug 1 -> Jul 30)
    let cells = screen.getAllByRole('cell').map(c => c.textContent);
    expect(cells[0]).toContain('Aug 3');

    // Switch to Date Oldest First (Jul 30 -> Aug 1 -> Aug 2 -> Aug 3)
    fireEvent.change(historySortSelect, { target: { value: 'date-asc' } });
    cells = screen.getAllByRole('cell').map(c => c.textContent);
    expect(cells[0]).toContain('Jul 30');

    // Switch to Recently Updated / Submitted First
    fireEvent.change(historySortSelect, { target: { value: 'updated-desc' } });
    cells = screen.getAllByRole('cell').map(c => c.textContent);
    expect(cells[0]).toContain('Aug 3');
  });
});
