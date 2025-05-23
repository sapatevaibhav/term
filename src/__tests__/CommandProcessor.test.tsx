import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { invoke } from '@tauri-apps/api/core';

vi.mock('@tauri-apps/api/shell', () => ({
    Command: vi.fn().mockImplementation(() => ({
        execute: vi.fn().mockResolvedValue({ stdout: 'mocked output' }),
    })),
}));

vi.mock('@tauri-apps/api/path', () => ({
    homeDir: vi.fn().mockResolvedValue('/home/user'),
    resolve: vi.fn().mockImplementation((path) => Promise.resolve(path)),
    basename: vi.fn().mockImplementation((path) => {
        const parts = path.split('/');
        return Promise.resolve(parts[parts.length - 1]);
    }),
}));

vi.mock('@tauri-apps/api/fs', () => ({
    readDir: vi.fn().mockResolvedValue([
        { name: 'file1.txt', children: undefined },
        { name: 'file2.txt', children: undefined },
        { name: 'folder1', children: [] }
    ]),
    exists: vi.fn().mockResolvedValue(true),
}));

vi.mock('@tauri-apps/api/window', () => {
    const mockClose = vi.fn();
    return {
        getCurrentWindow: vi.fn().mockReturnValue({
            close: mockClose
        }),
        __getMockClose: () => mockClose
    };
});

vi.mock('@tauri-apps/api/core', () => ({
    invoke: vi.fn().mockImplementation((cmd, args) => {

        if (cmd === 'run_shell_command') {
            return Promise.resolve('');
        }

        if (cmd === 'run_sudo_command') {
            const command = args?.command || '';
            if (args?.password === 'password123') {
                return Promise.resolve(`[sudo] password for user: \n${command} executed successfully`);
            }
            return Promise.reject(new Error('sudo: incorrect password'));
        }

        return Promise.resolve('');
    })
}));


import useCommandProcessor from '../components/Terminal/CommandProcessor';

import * as windowModule from '@tauri-apps/api/window';

describe('CommandProcessor Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('initializes without crashing', () => {
        const mockProps = {
            input: '',
            setInput: vi.fn(),
            appendHistory: vi.fn(),
            setIsProcessing: vi.fn(),
            clearTerminal: vi.fn()
        };

        const { result } = renderHook(() => useCommandProcessor(mockProps));


        expect(result.current).toBeDefined();
        expect(typeof result.current.handleSubmit).toBe('function');
    });

    it('executes echo command with empty output', async () => {
        const mockProps = {
            input: 'echo hello world',
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
            persist: () => { },
            stopPropagation: () => { },
        } as unknown as React.FormEvent<HTMLFormElement>;

        await act(async () => {
            await result.current.handleSubmit(mockEvent);
        });


        expect(mockProps.appendHistory).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'command',
                content: 'echo hello world'
            })
        );


        expect(mockProps.appendHistory).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'output',
                content: ''
            })
        );


        expect(mockProps.appendHistory).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'separator',
                content: ''
            })
        );
    });

    it('processes a clear command', async () => {
        const mockProps = {
            input: 'clear',
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
            persist: () => { },
            stopPropagation: () => { },
        } as unknown as React.FormEvent<HTMLFormElement>;

        await act(async () => {
            await result.current.handleSubmit(mockEvent);
        });


        expect(mockProps.clearTerminal).toHaveBeenCalled();

        expect(mockProps.setInput).toHaveBeenCalledWith('');
    });

    it('processes an exit command', async () => {
        const mockProps = {
            input: 'exit',
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
            persist: () => { },
            stopPropagation: () => { },
        } as unknown as React.FormEvent<HTMLFormElement>;

        await act(async () => {
            await result.current.handleSubmit(mockEvent);
        });


        const mockWindowModule = windowModule as any;
        const mockClose = mockWindowModule.__getMockClose();


        expect(mockClose).toHaveBeenCalled();
    });

    it('executes cat command with empty output', async () => {
        const mockProps = {
            input: 'cat file.txt',
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
            persist: () => { },
            stopPropagation: () => { },
        } as unknown as React.FormEvent<HTMLFormElement>;

        await act(async () => {
            await result.current.handleSubmit(mockEvent);
        });


        expect(mockProps.appendHistory).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'command',
                content: 'cat file.txt'
            })
        );


        expect(mockProps.appendHistory).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'output',
                content: ''
            })
        );


        expect(mockProps.appendHistory).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'separator',
                content: ''
            })
        );
    });

    it('handles file not found with empty output', async () => {
        const mockProps = {
            input: 'cat nonexistent.txt',
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
            persist: () => { },
            stopPropagation: () => { },
        } as unknown as React.FormEvent<HTMLFormElement>;

        await act(async () => {
            await result.current.handleSubmit(mockEvent);
        });


        expect(mockProps.appendHistory).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'command',
                content: 'cat nonexistent.txt'
            })
        );


        expect(mockProps.appendHistory).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'output',
                content: ''
            })
        );


        expect(mockProps.appendHistory).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'separator',
                content: ''
            })
        );
    });


    it('processes a sudo command', async () => {
        const mockProps = {
            input: 'sudo apt update',
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
            persist: () => { },
            stopPropagation: () => { },
        } as unknown as React.FormEvent<HTMLFormElement>;

        await act(async () => {
            await result.current.handleSubmit(mockEvent);
        });


        expect(result.current.showPasswordDialog).toBe(true);


        expect(result.current.pendingSudoCommand).toBe('sudo apt update');
    });

    it('handles sudo with correct password', async () => {
        const mockInvoke = vi.mocked(invoke);

        const mockProps = {
            input: 'sudo apt update',
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
            persist: () => { },
            stopPropagation: () => { },
        } as unknown as React.FormEvent<HTMLFormElement>;

        await act(async () => {
            await result.current.handleSubmit(mockEvent);
        });


        mockInvoke.mockClear();


        await act(async () => {
            if (typeof result.current.handleSudoWithPassword === 'function') {
                await result.current.handleSudoWithPassword('password123');
            }
        });


        expect(mockInvoke).toHaveBeenCalledWith('run_sudo_command', expect.objectContaining({
            password: 'password123'
        }));


        expect(mockProps.appendHistory).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'output',
                content: expect.stringContaining('executed successfully')
            })
        );
    });

    it('handles sudo with incorrect password', async () => {
        const mockInvoke = vi.mocked(invoke);

        const mockProps = {
            input: 'sudo apt update',
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
            persist: () => { },
            stopPropagation: () => { },
        } as unknown as React.FormEvent<HTMLFormElement>;

        await act(async () => {
            await result.current.handleSubmit(mockEvent);
        });


        mockInvoke.mockClear();


        await act(async () => {
            if (typeof result.current.handleSudoWithPassword === 'function') {
                await result.current.handleSudoWithPassword('wrongpassword');
            }
        });


        expect(mockProps.appendHistory).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'error',
                content: expect.stringContaining('incorrect password')
            })
        );
    });

    it('handles unknown commands with empty output', async () => {
        const mockProps = {
            input: 'nonexistent_command',
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
            persist: () => { },
            stopPropagation: () => { },
        } as unknown as React.FormEvent<HTMLFormElement>;

        await act(async () => {
            await result.current.handleSubmit(mockEvent);
        });


        expect(mockProps.appendHistory).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'command',
                content: 'nonexistent_command'
            })
        );


        expect(mockProps.appendHistory).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'output',
                content: ''
            })
        );


        expect(mockProps.appendHistory).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'separator',
                content: ''
            })
        );
    });

    it('validates command execution flow', async () => {
        const mockProps = {
            input: 'echo test',
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
            persist: () => { },
            stopPropagation: () => { },
        } as unknown as React.FormEvent<HTMLFormElement>;

        await act(async () => {
            await result.current.handleSubmit(mockEvent);
        });


        expect(mockProps.setIsProcessing).toHaveBeenCalledWith(true);
        expect(mockProps.setIsProcessing).toHaveBeenCalledWith(false);
        expect(mockProps.setInput).toHaveBeenCalledWith('');


        const calls = mockProps.appendHistory.mock.calls;
        expect(calls[0][0]).toEqual(expect.objectContaining({
            type: 'command',
            content: 'echo test'
        }));
        expect(calls[1][0]).toEqual(expect.objectContaining({
            type: 'output',
            content: ''
        }));
        expect(calls[2][0]).toEqual(expect.objectContaining({
            type: 'separator',
            content: ''
        }));
    });
});
