import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
// Use the correct import path
import Terminal from '../components/Terminal'; // This might be the correct import

// Mock child components to prevent memory issues
vi.mock('../components/Terminal/TerminalOutput', () => ({
  default: () => <div data-testid="terminal-output">Mocked Output</div>
}));

vi.mock('../components/Terminal/TerminalInput', () => ({
  default: () => <div data-testid="terminal-input">Mocked Input</div>
}));

describe('Terminal Layout', () => {
  it('renders the terminal container', () => {
    render(<Terminal />);
    // The actual container has a class name instead of a data-testid
    const container = document.querySelector('.flex.flex-col.h-screen.w-screen.bg-gray-900');
    expect(container).toBeInTheDocument();
  });
  
  it('renders the terminal output component', () => {
    render(<Terminal />);
    // This might be mocked or we need to find it differently
    const output = screen.getByTestId('terminal-output') || 
                  document.querySelector('.terminal-output');
    expect(output).toBeInTheDocument();
  });
  
  it('renders the terminal input component', () => {
    render(<Terminal />);
    // This might be mocked or we need to find it differently
    const input = screen.getByTestId('terminal-input') || 
                 document.querySelector('.terminal-input');
    expect(input).toBeInTheDocument();
  });
});