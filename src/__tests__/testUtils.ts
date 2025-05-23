import { vi } from 'vitest';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import React from 'react';

// Export testing library
export * from '@testing-library/react';

// Mock setup needs to happen at the module level, not inside a function
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
  readDir: vi.fn().mockResolvedValue([]),
  exists: vi.fn().mockResolvedValue(true),
}));

// Add a custom render function if needed
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, {...options});

export { customRender as render };

// Add any custom render functions or test utilities here
export const setupTestEnvironment = () => {
	// Setup code for initializing test environment
};

export const cleanupTestEnvironment = () => {
	// Cleanup code for resetting test environment
};
