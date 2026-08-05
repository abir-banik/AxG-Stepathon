import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HostAdminPanel from '../components/HostAdminPanel';
import { Team, User } from '../types';

const mockTeams: Team[] = [
  { id: 'team-1', name: 'Boba Walkers', color: '#4285F4', iconId: 'trophy', location: 'Seattle', lat: 47.6, lng: -122.3 }
];

const mockUsers: User[] = [
  { id: 'user-1', name: 'Alice', teamId: 'team-1', teamName: 'Boba Walkers', steps: 10000, weeklySteps: {}, stepHistory: [], iconId: 'smile' }
];

describe('HostAdminPanel Component', () => {
  it('renders locked view by default if isAdmin is false', () => {
    const setIsAdmin = vi.fn();
    render(
      <HostAdminPanel
        teams={mockTeams}
        users={mockUsers}
        onAddTeam={vi.fn()}
        onDeleteTeam={vi.fn()}
        onAddParticipant={vi.fn()}
        onRemoveParticipant={vi.fn()}
        isAdmin={false}
        setIsAdmin={setIsAdmin}
      />
    );

    expect(screen.getByText('Host & Admin Portal')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter Passcode...')).toBeInTheDocument();
  });

  it('fails to unlock with incorrect passcode', () => {
    const setIsAdmin = vi.fn();
    render(
      <HostAdminPanel
        teams={mockTeams}
        users={mockUsers}
        onAddTeam={vi.fn()}
        onDeleteTeam={vi.fn()}
        onAddParticipant={vi.fn()}
        onRemoveParticipant={vi.fn()}
        isAdmin={false}
        setIsAdmin={setIsAdmin}
      />
    );

    const input = screen.getByPlaceholderText('Enter Passcode...');
    const button = screen.getByRole('button', { name: /unlock/i });

    fireEvent.change(input, { target: { value: 'wrongpass' } });
    fireEvent.click(button);

    expect(setIsAdmin).not.toHaveBeenCalled();
  });

  it('unlocks with correct passcode AxGstepathon2026', () => {
    const setIsAdmin = vi.fn();
    render(
      <HostAdminPanel
        teams={mockTeams}
        users={mockUsers}
        onAddTeam={vi.fn()}
        onDeleteTeam={vi.fn()}
        onAddParticipant={vi.fn()}
        onRemoveParticipant={vi.fn()}
        isAdmin={false}
        setIsAdmin={setIsAdmin}
      />
    );

    const input = screen.getByPlaceholderText('Enter Passcode...');
    const button = screen.getByRole('button', { name: /unlock/i });

    fireEvent.change(input, { target: { value: 'AxGstepathon2026' } });
    fireEvent.click(button);

    expect(setIsAdmin).toHaveBeenCalledWith(true);
  });

  it('renders admin forms when isAdmin is true', () => {
    render(
      <HostAdminPanel
        teams={mockTeams}
        users={mockUsers}
        onAddTeam={vi.fn()}
        onDeleteTeam={vi.fn()}
        onAddParticipant={vi.fn()}
        onRemoveParticipant={vi.fn()}
        isAdmin={true}
        setIsAdmin={vi.fn()}
      />
    );

    expect(screen.getByText('Host Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Boba Striders')).toBeInTheDocument();
    expect(screen.getByText('Create Team & Add All Members At Once')).toBeInTheDocument();
  });

  it('allows adding and removing member inputs dynamically', () => {
    render(
      <HostAdminPanel
        teams={mockTeams}
        users={mockUsers}
        onAddTeam={vi.fn()}
        onDeleteTeam={vi.fn()}
        onAddParticipant={vi.fn()}
        onRemoveParticipant={vi.fn()}
        isAdmin={true}
        setIsAdmin={vi.fn()}
      />
    );

    // Default renders 5 rows
    expect(screen.getByPlaceholderText('Member 1 Name...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Member 5 Name...')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Member 6 Name...')).not.toBeInTheDocument();

    // Add Member Row
    const addBtn = screen.getByText('Add Member Slot');
    fireEvent.click(addBtn);

    expect(screen.getByPlaceholderText('Member 6 Name...')).toBeInTheDocument();
  });

  it('submits bulk creation form successfully and calls API handlers', async () => {
    const onAddTeam = vi.fn().mockResolvedValue({ id: 'new-team-id', name: 'Manila Trailblazers' });
    const onAddParticipant = vi.fn();

    render(
      <HostAdminPanel
        teams={mockTeams}
        users={mockUsers}
        onAddTeam={onAddTeam}
        onDeleteTeam={vi.fn()}
        onAddParticipant={onAddParticipant}
        onRemoveParticipant={vi.fn()}
        isAdmin={true}
        setIsAdmin={vi.fn()}
      />
    );

    // Set team name
    fireEvent.change(screen.getByPlaceholderText('e.g. Boba Striders'), { target: { value: 'Manila Trailblazers' } });

    // Set member name inputs
    fireEvent.change(screen.getByPlaceholderText('Member 1 Name...'), { target: { value: 'Alice Smith' } });
    fireEvent.change(screen.getByPlaceholderText('Member 2 Name...'), { target: { value: 'Bob Jones' } });

    // Click submit
    const submitBtn = screen.getByRole('button', { name: /create batch of teams & add members/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onAddTeam).toHaveBeenCalled();
    });

    expect(onAddParticipant).toHaveBeenCalledTimes(2);
    expect(onAddParticipant).toHaveBeenNthCalledWith(1, 'Alice Smith', 'new-team-id', 'Manila Trailblazers', 'smile');
    expect(onAddParticipant).toHaveBeenNthCalledWith(2, 'Bob Jones', 'new-team-id', 'Manila Trailblazers', 'smile');
  });

  it('submits multiple manual step overrides exceeding 30,000 steps with autocomplete search', async () => {
    const onAddSteps = vi.fn().mockResolvedValue(undefined);

    render(
      <HostAdminPanel
        teams={mockTeams}
        users={mockUsers}
        onAddTeam={vi.fn()}
        onDeleteTeam={vi.fn()}
        onAddParticipant={vi.fn()}
        onRemoveParticipant={vi.fn()}
        onAddSteps={onAddSteps}
        isAdmin={true}
        setIsAdmin={vi.fn()}
      />
    );

    expect(screen.getByText('Host Manual Step Entry & Proof Override')).toBeInTheDocument();

    // Type in autocomplete search input
    const searchInput = screen.getByPlaceholderText('Type participant name or team (e.g. Alice)...');
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    // Select participant from dropdown menu
    const participantBtn = screen.getByRole('button', { name: /alice/i });
    fireEvent.click(participantBtn);

    // Verify participant chip is shown
    expect(screen.getByText('Switch Participant')).toBeInTheDocument();

    // Enter steps > 30k in row 1
    const stepsInput1 = screen.getByPlaceholderText('e.g. 45000');
    fireEvent.change(stepsInput1, { target: { value: '45000' } });

    // Click "Add Another Entry" row
    const addRowBtn = screen.getByText('Add Another Entry');
    fireEvent.click(addRowBtn);

    // Enter steps in row 2
    const stepsInputs = screen.getAllByPlaceholderText('e.g. 45000');
    expect(stepsInputs.length).toBe(2);
    fireEvent.change(stepsInputs[1], { target: { value: '35000' } });

    // Submit batch form
    const submitBtn = screen.getByRole('button', { name: /save all \(2\) step overrides/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onAddSteps).toHaveBeenCalledTimes(2);
      expect(onAddSteps).toHaveBeenNthCalledWith(1, 'user-1', 45000, expect.any(Number), expect.any(String), true);
      expect(onAddSteps).toHaveBeenNthCalledWith(2, 'user-1', 35000, expect.any(Number), expect.any(String), true);
    });
  });
});
