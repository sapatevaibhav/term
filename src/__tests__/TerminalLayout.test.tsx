import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Terminal from '../components/Terminal';


vi.mock('../components/Terminal/TerminalOutput', () => ({
  default: () => <div data-testid="terminal-output">Mocked Output</div>
}));

vi.mock('../components/Terminal/TerminalInput', () => ({
  default: () => <div data-testid="terminal-input">Mocked Input</div>
}));

describe('Terminal Layout', () => {
  it('renders the terminal container', () => {
    render(<Terminal />);

    const container = document.querySelector('.flex.flex-col.h-screen.w-screen.bg-gray-900');
    expect(container).toBeInTheDocument();
  });

  it('renders the terminal output component', () => {
    render(<Terminal />);

    const output = screen.getByTestId('terminal-output') ||
                  document.querySelector('.terminal-output');
    expect(output).toBeInTheDocument();
  });

  it('renders the terminal input component', () => {
    render(<Terminal />);

    const input = screen.getByTestId('terminal-input') ||
                 document.querySelector('.terminal-input');
    expect(input).toBeInTheDocument();
  });
});
