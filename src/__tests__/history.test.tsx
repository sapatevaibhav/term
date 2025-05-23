import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import useCommandHistory from '../hooks/useCommandHistory';

describe('Command History Hook', () => {
  it('initializes with empty history', () => {
    const { result } = renderHook(() => useCommandHistory());

    expect(result.current.commandHistory).toEqual([]);
  });

  it('adds commands to history', () => {
    const { result } = renderHook(() => useCommandHistory());

    act(() => {

      result.current.addToHistory('ls -la');
    });

    expect(result.current.commandHistory).toContain('ls -la');
  });

  it('navigates through history upward', () => {
    const { result } = renderHook(() => useCommandHistory());


    act(() => {
      result.current.addToHistory('first command');
      result.current.addToHistory('second command');
      result.current.addToHistory('third command');
    });


    let previousCommand;
    act(() => {
      previousCommand = result.current.navigateHistory('up');
    });


    expect(previousCommand).toBe('third command');


    act(() => {
      previousCommand = result.current.navigateHistory('up');
    });


    expect(previousCommand).toBe('second command');
  });

  it('navigates through history downward', () => {
    const { result } = renderHook(() => useCommandHistory());


    act(() => {
      result.current.addToHistory('first command');
      result.current.addToHistory('second command');
      result.current.addToHistory('third command');
    });


    act(() => {
      result.current.navigateHistory('up');
      result.current.navigateHistory('up');
    });


    let nextCommand;
    act(() => {
      nextCommand = result.current.navigateHistory('down');
    });



    expect(nextCommand).toBe('');
  });

  it('maintains history index correctly', () => {
    const { result } = renderHook(() => useCommandHistory());


    expect(result.current.historyIndex).toBe(-1);


    act(() => {
      result.current.addToHistory('command 1');
      result.current.addToHistory('command 2');
    });


    act(() => {
      result.current.navigateHistory('up');
    });


    expect(result.current.historyIndex).toBe(0);


    act(() => {
      result.current.addToHistory('command 3');
    });


    expect(result.current.historyIndex).toBe(-1);
  });

  it('handles navigation past history boundaries correctly', () => {
    const { result } = renderHook(() => useCommandHistory());


    act(() => {
      result.current.addToHistory('command 1');
    });


    let command;
    act(() => {
      command = result.current.navigateHistory('up');
    });
    expect(command).toBe('command 1');


    act(() => {
      command = result.current.navigateHistory('up');
    });
    expect(command).toBeUndefined();


    act(() => {
      result.current.navigateHistory('down');
      command = result.current.navigateHistory('down');
    });
    expect(command).toBe('');
  });
});
