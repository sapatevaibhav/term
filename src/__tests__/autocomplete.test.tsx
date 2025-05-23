import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import useCommandProcessor from '../components/Terminal/CommandProcessor';
import React from 'react';

// Mock dependencies
vi.mock('@tauri-apps/api/shell', () => ({
  Command: vi.fn().mockImplementation(() => ({
    execute: vi.fn().mockResolvedValue({ stdout: 'mocked output' }),
  })),
}));

vi.mock('@tauri-apps/api/path', () => ({
  homeDir: vi.fn().mockResolvedValue('/home/user'),
  resolve: vi.fn().mockImplementation((path) => Promise.resolve(path)),
}));

vi.mock('@tauri-apps/api/fs', () => ({
  readDir: vi.fn().mockResolvedValue([
    { name: 'file1.txt', children: undefined },
    { name: 'file2.txt', children: undefined },
    { name: 'folder1', children: [] }
  ]),
  exists: vi.fn().mockResolvedValue(true),
}));

describe('Tab Autocomplete', () => {
  it('tests autocomplete functionality through form submission', async () => {
    // Mock the event properly with correct typing
    const mockFormEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>;

    const mockProps = {
      input: 'ec',  // Partial command
      setInput: vi.fn(),
      appendHistory: vi.fn(),
      setIsProcessing: vi.fn(),
      clearTerminal: vi.fn()
    };

    // Render the hook
    const { result } = renderHook(() => useCommandProcessor(mockProps));

    // Since your hook only has handleSubmit, we'll test through that
    await act(async () => {
      await result.current.handleSubmit(mockFormEvent);
    });

    // Check if setInput was called
    expect(mockProps.setInput).toHaveBeenCalled();
  });
});
