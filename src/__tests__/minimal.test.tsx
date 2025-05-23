import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Minimal test', () => {
  it('renders basic HTML', () => {
    render(<div data-testid="test-element">Test</div>);
    expect(screen.getByTestId('test-element')).toBeInTheDocument();
  });
});
