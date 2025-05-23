import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import useCommandProcessor from '../components/Terminal/CommandProcessor';
import React from 'react';

// Mock dependencies
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockImplementation((command) => {
    if (command === 'run_sudo_command') {
      return Promise.resolve('sudo command executed');
    }
    return Promise.resolve('mocked result');
  }),
}));

describe('Sudo Command', () => {
  it('shows password dialog when sudo command is entered', async () => {
    const mockProps = {
      input: 'sudo pacman -Sy',
      setInput: vi.fn(),
      appendHistory: vi.fn(),
      setIsProcessing: vi.fn(),
      clearTerminal: vi.fn()
    };

    const { result } = renderHook(() => useCommandProcessor(mockProps));

    // Create a mock event
    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    // Check if showPasswordDialog was set to true
    expect(result.current.showPasswordDialog).toBe(true);
  });
});
