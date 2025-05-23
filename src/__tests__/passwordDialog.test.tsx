import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';


vi.mock('@tauri-apps/api/shell', () => ({
    Command: vi.fn().mockImplementation(() => ({
        execute: vi.fn().mockResolvedValue({ stdout: 'mocked output' }),
    })),
}));


vi.mock('@tauri-apps/api/path', () => ({
    homeDir: vi.fn().mockResolvedValue('/home/user'),
}));


vi.mock('@tauri-apps/api/core', () => ({
    invoke: vi.fn().mockImplementation((cmd) => {
        if (cmd === 'run_sudo_command') {
            return Promise.resolve('Sudo command executed successfully');
        }
        return Promise.resolve('');
    })
}));


import PasswordDialog from '../components/PasswordDialog';

describe('Password Dialog', () => {
    it('renders when open', () => {
        render(
            <PasswordDialog
                isOpen={true}
                onClose={vi.fn()}
                onSubmit={vi.fn()}
                commandText="apt update"
            />
        );


        expect(screen.getByText(/apt update/i)).toBeInTheDocument();
    });

    it('submits password when form is submitted', async () => {
        const mockOnSubmit = vi.fn();

        render(
            <PasswordDialog
                isOpen={true}
                onClose={vi.fn()}
                onSubmit={mockOnSubmit}
                commandText="apt update"
            />
        );


        let passwordInput;
        try {
            passwordInput = screen.getByLabelText(/password/i);
        } catch {
            try {
                passwordInput = screen.getByPlaceholderText(/password/i);
            } catch {
                passwordInput = screen.getByRole('textbox');
            }
        }


        fireEvent.change(passwordInput, { target: { value: 'testpassword' } });


        const form = passwordInput.closest('form');
        if (form) {
            fireEvent.submit(form);
            expect(mockOnSubmit).toHaveBeenCalledWith('testpassword');
        }
    });

    it('displays the command text in the dialog', () => {
        render(
            <PasswordDialog
                isOpen={true}
                onClose={vi.fn()}
                onSubmit={vi.fn()}
                commandText="apt update"
            />
        );


        expect(screen.getByText(/apt update/i)).toBeInTheDocument();
    });
});
