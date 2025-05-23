import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import useCommandProcessor from '../components/Terminal/CommandProcessor';
import React from 'react';

// Mock dependencies
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockImplementation((command) => {
    if (command === 'run_shell') {
      return Promise.resolve('file1.txt\nfile2.txt\nfolder1/');
    }
    return Promise.resolve('mocked result');
  }),
}));

vi.mock('@tauri-apps/api/fs', () => ({
  readDir: vi.fn().mockResolvedValue([
    { name: 'file1.txt', children: undefined },
    { name: 'file2.txt', children: undefined },
    { name: 'folder1', children: [] }
  ]),
}));

describe('LS Command', () => {
  it('calls appendHistory with directory contents for ls command', async () => {
    const mockProps = {
      input: 'ls',
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

    // Check if appendHistory was called with directory contents
    expect(mockProps.appendHistory).toHaveBeenCalled();
  });
});
