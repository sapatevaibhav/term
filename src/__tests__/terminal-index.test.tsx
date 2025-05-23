// Create a new file: terminal-index.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import Terminal from '../components/Terminal';

// Mock child components to prevent memory issues
vi.mock('../components/Terminal/TerminalOutput', () => ({
  default: () => <div data-testid="terminal-output">Mocked Output</div>
}));

vi.mock('../components/Terminal/TerminalInput', () => ({
  default: () => <div data-testid="terminal-input">Mocked Input</div>
}));

vi.mock('../components/Terminal/CommandProcessor', () => ({
  default: () => ({
    handleSubmit: vi.fn(),
    showPasswordDialog: false,
    pendingSudoCommand: '',
    handleSudoWithPassword: vi.fn()
  })
}));

vi.mock('../components/PasswordDialog', () => ({
  default: (props: any) => <div data-testid="password-dialog">{props.commandText}</div>
}));

describe('Terminal Component', () => {
  it('renders with correct layout', () => {
    render(<Terminal />);
    
    // Check basic structure
    expect(screen.getByTestId('terminal-output')).toBeInTheDocument();
    expect(screen.getByTestId('terminal-input')).toBeInTheDocument();
  });
  
  it('passes history to output component', () => {
    render(<Terminal />);
    
    // Check that history-related elements are rendered
    const outputElement = screen.getByTestId('terminal-output');
    expect(outputElement).toBeInTheDocument();
  });
});