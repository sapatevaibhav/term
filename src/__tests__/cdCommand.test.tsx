import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import useCommandProcessor from '../components/Terminal/CommandProcessor';

// Mock dependencies
const mockExecute = vi.fn().mockResolvedValue({ stdout: 'mocked output' });
vi.mock('@tauri-apps/api/shell', () => ({
  Command: vi.fn().mockImplementation(() => ({
    execute: mockExecute,
  })),
}));

// Mock invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockImplementation((command) => {
    if (command === 'change_directory') {
      return Promise.resolve('/home/user/newdir');
    }
    return Promise.resolve('mocked result');
  }),
}));

const mockHomeDir = vi.fn().mockResolvedValue('/home/user');
const mockResolve = vi.fn().mockImplementation((path) => Promise.resolve(path));
vi.mock('@tauri-apps/api/path', () => ({
  homeDir: mockHomeDir,
  resolve: mockResolve,
}));

vi.mock('@tauri-apps/api/fs', () => ({
  exists: vi.fn().mockResolvedValue(true),
}));

describe('CD Command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls appendHistory when changing directory', async () => {
    const mockProps = {
      input: 'cd ~',
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

    // Check if appendHistory was called
    expect(mockProps.appendHistory).toHaveBeenCalled();
  });
});
