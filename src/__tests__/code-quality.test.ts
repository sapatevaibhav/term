import { describe, it, expect } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('Code formatting and linting tests', () => {
    it('ESLint should pass with no errors or warnings', async () => {
        try {
            const { stdout, stderr } = await execAsync('npm run lint');

            if (stderr) {
                console.warn('ESLint warnings:', stderr);
            }
            expect(stdout).toBeDefined();
        } catch (error: any) {
            console.error('ESLint errors:', error.stdout, error.stderr);
            throw new Error('ESLint check failed');
        }
    });

    it('Prettier formatting should be consistent', async () => {
        try {
            await execAsync('npm run format:check');

        } catch (error: any) {
            console.error('Prettier errors:', error.stdout, error.stderr);
            throw new Error('Prettier check failed - some files need formatting');
        }
    });

    it('Rust code should pass rustfmt check', async () => {
        try {
            await execAsync('cd src-tauri && cargo fmt --all -- --check');
        } catch (error: any) {
            console.error('Rustfmt errors:', error.stdout, error.stderr);
            throw new Error('Rustfmt check failed - some Rust files need formatting');
        }
    });

    it('Rust code should pass clippy check', async () => {
        try {
            const { stdout, stderr } = await execAsync('cd src-tauri && cargo clippy -- -D warnings');
            if (stderr && !stderr.includes('Checking')) {
                console.warn('Clippy warnings:', stderr);
            }
            expect(stdout).toBeDefined();
        } catch (error: any) {
            console.error('Clippy errors:', error.stdout, error.stderr);
            throw new Error('Clippy check failed');
        }
    });
});
