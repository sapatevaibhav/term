import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import useCommandProcessor from '../components/Terminal/CommandProcessor';


const mockExecute = vi.fn().mockResolvedValue({ stdout: 'mocked output' });
vi.mock('@tauri-apps/api/shell', () => ({
  Command: vi.fn().mockImplementation(() => ({
    execute: mockExecute,
  })),
}));


vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockImplementation((command) => {
    if (command === 'change_directory') {
      return Promise.resolve('/home/user/newdir');
    }
    if (command === 'run_shell_command') {
      return Promise.resolve('');
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

  it('handles cd command execution flow', async () => {
    const mockProps = {
      input: 'cd ~',
      setInput: vi.fn(),
      appendHistory: vi.fn(),
      setIsProcessing: vi.fn(),
      clearTerminal: vi.fn()
    };

    const { result } = renderHook(() => useCommandProcessor(mockProps));


    const mockEvent = {
      preventDefault: vi.fn(),
      target: document.createElement('form'),
      currentTarget: document.createElement('form'),
      bubbles: true,
      cancelable: true,
      defaultPrevented: false,
      timeStamp: Date.now(),
      nativeEvent: new Event('submit'),
      isDefaultPrevented: () => false,
      isPropagationStopped: () => false,
      persist: () => {},
      stopPropagation: () => {},
    } as unknown as React.FormEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });


    expect(mockProps.appendHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'command',
        content: 'cd ~'
      })
    );


    expect(mockProps.setIsProcessing).toHaveBeenCalledWith(true);
    expect(mockProps.setIsProcessing).toHaveBeenCalledWith(false);


    expect(mockProps.setInput).toHaveBeenCalledWith('');
  });

  it('handles cd command with specific directory', async () => {
    const mockProps = {
      input: 'cd /home/user/Documents',
      setInput: vi.fn(),
      appendHistory: vi.fn(),
      setIsProcessing: vi.fn(),
      clearTerminal: vi.fn()
    };

    const { result } = renderHook(() => useCommandProcessor(mockProps));

    const mockEvent = {
      preventDefault: vi.fn(),
      target: document.createElement('form'),
      currentTarget: document.createElement('form'),
      bubbles: true,
      cancelable: true,
      defaultPrevented: false,
      timeStamp: Date.now(),
      nativeEvent: new Event('submit'),
      isDefaultPrevented: () => false,
      isPropagationStopped: () => false,
      persist: () => {},
      stopPropagation: () => {},
    } as unknown as React.FormEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });


    expect(mockProps.appendHistory).toHaveBeenCalled();
    expect(mockProps.setInput).toHaveBeenCalledWith('');
  });
});
