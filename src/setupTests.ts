import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';


afterEach(() => {
    cleanup();
});


vi.mock('tauri-plugin-clipboard-api', () => ({
    writeText: vi.fn(),
    readText: vi.fn(),
}));


vi.mock('@tauri-apps/api/shell');
vi.mock('@tauri-apps/api/path');
vi.mock('@tauri-apps/api/fs');
vi.mock('@tauri-apps/api/app');
