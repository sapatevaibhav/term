import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// IMPORTANT: Mock the window API before importing the component
// Use inline function instead of referencing mockClose variable
vi.mock('@tauri-apps/api/window', () => {
  return {
    getCurrentWindow: vi.fn().mockReturnValue({
      close: vi.fn()
    })
  };
});

// Now import the component
import useCommandProcessor from '../components/Terminal/CommandProcessor';
// Import getCurrentWindow to access the mock in the test
import { getCurrentWindow } from '@tauri-apps/api/window';

describe('Exit Command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls window.close when exit command is entered', async () => {
    const mockProps = {
      input: 'exit',
      setInput: vi.fn(),
      appendHistory: vi.fn(),
      setIsProcessing: vi.fn(),
      clearTerminal: vi.fn()
    };

    const { result } = renderHook(() => useCommandProcessor(mockProps));

    const mockFormEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handleSubmit(mockFormEvent);
    });

    // Check if close was called by accessing the mock via the mocked function
    const closeMock = getCurrentWindow().close;
    expect(closeMock).toHaveBeenCalled();
  });
});
