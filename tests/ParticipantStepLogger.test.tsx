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
      { amount: 5000, date: '2026-10-20T12:00:00.000Z', week: 1 },
      { amount: 5000, date: '2026-10-19T12:00:00.000Z', week: 1 }
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
  it('renders roster search and dropdown filters with First L. formatted names', () => {
    render(
      <ParticipantStepLogger
        users={mockUsers}
        teams={mockTeams}
        onAddSteps={vi.fn()}
        onDeleteStep={vi.fn()}
      />
    );

    expect(screen.getByPlaceholderText('Search participant...')).toBeInTheDocument();
    expect(screen.getByText('Alice S.')).toBeInTheDocument();
    expect(screen.getByText('Bob J.')).toBeInTheDocument();
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

    expect(screen.getByText('Alice S.')).toBeInTheDocument();
    expect(screen.queryByText('Bob J.')).not.toBeInTheDocument();
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

    // Click on Alice S. in roster list
    const participantRow = screen.getByText('Alice S.');
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

    // Click on Alice S.
    fireEvent.click(screen.getByText('Alice S.'));

    const stepInput = screen.getByPlaceholderText('Enter steps (e.g. 5000)...');

    fireEvent.change(stepInput, { target: { value: '7000' } });
    fireEvent.submit(screen.getByRole('button', { name: /log steps/i }).closest('form')!);

    await waitFor(() => {
      expect(onAddSteps).toHaveBeenCalledWith('user-1', 7000, expect.any(Number), expect.any(String));
    });
  });

  it('automatically calculates week from date input across Weeks 1-5', async () => {
    const onAddSteps = vi.fn();
    render(
      <ParticipantStepLogger
        users={mockUsers}
        teams={mockTeams}
        onAddSteps={onAddSteps}
        onDeleteStep={vi.fn()}
      />
    );

    // Click on Alice S.
    fireEvent.click(screen.getByText('Alice S.'));

    const dateInput = screen.getByTitle('Select date of steps (October 19 to November 17 only)');
    const stepInput = screen.getByPlaceholderText('Enter steps (e.g. 5000)...');

    // Select date in Week 1 (October 19, 2026)
    fireEvent.change(dateInput, { target: { value: '2026-10-19' } });
    fireEvent.change(stepInput, { target: { value: '8000' } });

    fireEvent.submit(screen.getByRole('button', { name: /log steps/i }).closest('form')!);

    await waitFor(() => {
      expect(onAddSteps).toHaveBeenCalledWith('user-1', 8000, 1, '2026-10-19');
    });
  });

  it('validates date picker only allows dates from October 19th to November 17th', () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <ParticipantStepLogger
        users={mockUsers}
        teams={mockTeams}
        onAddSteps={vi.fn()}
        onDeleteStep={vi.fn()}
      />
    );

    // Click on Alice S.
    fireEvent.click(screen.getByText('Alice S.'));

    // Date picker input
    const dateInput = screen.getByTitle('Select date of steps (October 19 to November 17 only)') as HTMLInputElement;

    // Test date before October 19th
    fireEvent.change(dateInput, { target: { value: '2026-10-10' } });
    expect(alertMock).toHaveBeenCalledWith('Steps can only be logged starting from October 19th, 2026.');
    expect(dateInput.value).not.toBe('2026-10-10');

    // Test date after November 17th
    fireEvent.change(dateInput, { target: { value: '2026-11-25' } });
    expect(alertMock).toHaveBeenCalledWith('Steps can only be logged up to November 17th, 2026.');
    expect(dateInput.value).not.toBe('2026-11-25');

    alertMock.mockRestore();
  });

  it('enforces the 30,000 daily step cap on participant submissions', () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const onAddSteps = vi.fn();

    render(
      <ParticipantStepLogger
        users={mockUsers}
        teams={mockTeams}
        onAddSteps={onAddSteps}
        onDeleteStep={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Alice S.'));
    const stepInput = screen.getByPlaceholderText('Enter steps (e.g. 5000)...');
    fireEvent.change(stepInput, { target: { value: '35000' } });
    fireEvent.submit(screen.getByRole('button', { name: /log steps/i }).closest('form')!);

    expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('Maximum daily entry limit is 30,000 steps'));
    expect(onAddSteps).not.toHaveBeenCalled();

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

    // Click on Alice S.
    fireEvent.click(screen.getByText('Alice S.'));

    // History log list header
    expect(screen.getByText(/Step History for Alice S\./i)).toBeInTheDocument();

    // Verify history rows
    const deleteButtons = screen.getAllByTitle('Delete entry');
    expect(deleteButtons.length).toBe(2);

    // Click the first delete button
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
    expect(cardElements[0]).toContain('Alice S.');
    expect(cardElements[1]).toContain('Bob J.');

    // Change sort order to Z-A
    const sortDropdown = screen.getAllByRole('combobox')[1];
    fireEvent.change(sortDropdown, { target: { value: 'name-desc' } });

    const updatedCardElements = screen.getAllByRole('button').map(b => b.textContent);
    expect(updatedCardElements[0]).toContain('Bob J.');
    expect(updatedCardElements[1]).toContain('Alice S.');
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
        { amount: 26281, date: '2026-11-05', week: 3, submittedAt: '2026-11-06T10:00:00.000Z' },
        { amount: 24117, date: '2026-11-06', week: 3, submittedAt: '2026-11-06T11:00:00.000Z' },
        { amount: 20491, date: '2026-11-07', week: 3, submittedAt: '2026-11-06T12:00:00.000Z' },
        { amount: 20015, date: '2026-11-10', week: 4, submittedAt: '2026-11-11T10:00:00.000Z' }
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

    // Click on Sort U.
    fireEvent.click(screen.getByText('Sort U.'));

    // Step history sort dropdown
    const historySortSelect = screen.getByRole('combobox', { name: /sort step history/i });
    expect(historySortSelect).toBeInTheDocument();
    expect(historySortSelect).toHaveValue('date-desc');

    // Default: Date Most Recent First (Nov 10 -> Nov 7 -> Nov 6 -> Nov 5)
    let cells = screen.getAllByRole('cell').map(c => c.textContent);
    expect(cells[0]).toContain('Nov 10');

    // Switch to Date Oldest First (Nov 5 -> Nov 6 -> Nov 7 -> Nov 10)
    fireEvent.change(historySortSelect, { target: { value: 'date-asc' } });
    cells = screen.getAllByRole('cell').map(c => c.textContent);
    expect(cells[0]).toContain('Nov 5');

    // Switch to Recently Updated / Submitted First
    fireEvent.change(historySortSelect, { target: { value: 'updated-desc' } });
    cells = screen.getAllByRole('cell').map(c => c.textContent);
    expect(cells[0]).toContain('Nov 10');
  });

  it('displays kilometers when distanceUnit is km', () => {
    render(
      <ParticipantStepLogger
        users={mockUsers}
        teams={mockTeams}
        distanceUnit="km"
        onAddSteps={vi.fn()}
        onDeleteStep={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Alice S.'));
    expect(screen.getByText('Current Kilometers:')).toBeInTheDocument();
    expect(screen.getByText('8.0 km')).toBeInTheDocument();
  });
});
