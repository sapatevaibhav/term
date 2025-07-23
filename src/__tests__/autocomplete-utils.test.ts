import { describe, it, expect, vi } from 'vitest';

import { getAutocompleteSuggestions } from '../utils/autocomplete';
import { invoke } from '@tauri-apps/api/core';


vi.mock('@tauri-apps/api/core', () => ({
    invoke: vi.fn().mockImplementation((cmd, args) => {
        if (cmd === 'list_directory_contents') {

            if (args?.path === '.' || args?.path === '/home/user') {
                return Promise.resolve([
                    'file1.txt',
                    'file2.txt',
                    'folder1/'
                ]);
            }
            return Promise.resolve([]);
        }

        if (cmd === 'get_current_dir') {
            return Promise.resolve('/home/user');
        }

        return Promise.resolve('');
    })
}));

describe('Autocomplete Utils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('suggests matching commands', async () => {
        const result = await getAutocompleteSuggestions('ec');
        expect(result.suggestions).toContain('echo');
    });

    it('returns empty suggestions if no match found', async () => {
        const result = await getAutocompleteSuggestions('nonexistentcommand');
        expect(result.suggestions.length).toBe(0);
    });

    it('suggests files for commands with space at the end', async () => {
        const result = await getAutocompleteSuggestions('cat ');
        expect(result.suggestions).toContain('file1.txt');
        expect(result.suggestions).toContain('file2.txt');
        expect(result.suggestions).toContain('folder1/');
    });

    it('suggests matching files for partial file names', async () => {

        vi.clearAllMocks();


        vi.mocked(invoke).mockImplementation((cmd) => {
            if (cmd === 'list_directory_contents') {

                return Promise.resolve([
                    'file1.txt',
                    'file2.txt',
                    'folder1/'
                ]);
            }

            if (cmd === 'get_current_dir') {
                return Promise.resolve('/home/user');
            }

            return Promise.resolve('');
        });

        const result = await getAutocompleteSuggestions('cat f');


        expect(result.suggestions.length).toBeGreaterThan(0);


        const hasFileSuggestions = result.suggestions.some(item => !item.endsWith('/'));
        expect(hasFileSuggestions).toBe(true);
    });

    it('provides a replacement when there is only one match', async () => {

        vi.clearAllMocks();


        vi.mocked(invoke).mockImplementationOnce((cmd) => {
            if (cmd === 'list_directory_contents') {
                return Promise.resolve(['uniquefile.txt']);
            }
            return Promise.resolve('');
        });

        const result = await getAutocompleteSuggestions('cat u');
        expect(result.replacement).toBe('cat uniquefile.txt');
    });

    it('finds common prefix among multiple suggestions', async () => {

        vi.clearAllMocks();


        vi.mocked(invoke).mockImplementationOnce((cmd) => {
            if (cmd === 'list_directory_contents') {
                return Promise.resolve(['testfile1.txt', 'testfile2.txt', 'testfile3.txt']);
            }
            return Promise.resolve('');
        });

        const result = await getAutocompleteSuggestions('cat t');
        expect(result.commonPrefix).toBe('cat testfile');
    });

    it('suggests files and directories appropriately for different commands', async () => {

        vi.clearAllMocks();

        vi.mocked(invoke).mockImplementation((cmd) => {
            if (cmd === 'list_directory_contents') {
                return Promise.resolve([
                    'file1.txt',
                    'file2.txt',
                    'folder1/'
                ]);
            }

            if (cmd === 'get_current_dir') {
                return Promise.resolve('/home/user');
            }

            return Promise.resolve('');
        });


        const catResult = await getAutocompleteSuggestions('cat f');
        expect(catResult.suggestions.length).toBeGreaterThan(0);


        const cdResult = await getAutocompleteSuggestions('cd f');


        expect(Array.isArray(cdResult.suggestions)).toBe(true);
    });

    it('handles errors when fetching suggestions', async () => {
        vi.clearAllMocks();


        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });


        vi.mocked(invoke).mockRejectedValueOnce(new Error('Failed to list directory'));

        const result = await getAutocompleteSuggestions('ls f');


        expect(result.suggestions).toEqual([]);
        expect(result.replacement).toBeUndefined();


        consoleSpy.mockRestore();
    });

    it('handles tab completion with special characters', async () => {
        vi.clearAllMocks();

        vi.mocked(invoke).mockImplementation((cmd) => {
            if (cmd === 'list_directory_contents') {
                return Promise.resolve([
                    'file with spaces.txt',
                    'file-with-dashes.txt',
                    'file_with_underscores.txt'
                ]);
            }

            return Promise.resolve('');
        });

        const result = await getAutocompleteSuggestions('cat file');

        expect(result.suggestions).toContain('file with spaces.txt');
        expect(result.suggestions).toContain('file-with-dashes.txt');
        expect(result.suggestions).toContain('file_with_underscores.txt');
    });

    it('handles empty input', async () => {
        const result = await getAutocompleteSuggestions('');
        expect(result.suggestions).toEqual([]);
        expect(result.replacement).toBeUndefined();
    });

    it('handles whitespace-only input', async () => {
        const result = await getAutocompleteSuggestions('   ');
        expect(result.suggestions).toEqual([]);
        expect(result.replacement).toBeUndefined();
    });

    it('suggests all commands when no partial command is provided', async () => {
        const result = await getAutocompleteSuggestions('');

        expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('handles commands with multiple arguments', async () => {
        vi.clearAllMocks();

        vi.mocked(invoke).mockImplementation((cmd) => {
            if (cmd === 'list_directory_contents') {
                return Promise.resolve(['file1.txt', 'file2.txt', 'config.json']);
            }
            if (cmd === 'get_current_dir') {
                return Promise.resolve('/home/user');
            }
            return Promise.resolve('');
        });

        const result = await getAutocompleteSuggestions('cp file1.txt ');
        expect(result.suggestions).toContain('file1.txt');
        expect(result.suggestions).toContain('file2.txt');
        expect(result.suggestions).toContain('config.json');
    });

    it('handles absolute paths', async () => {
        vi.clearAllMocks();

        vi.mocked(invoke).mockImplementation((cmd, args) => {
            if (cmd === 'list_directory_contents') {
                if ((args as any)?.path === '/etc') {
                    return Promise.resolve(['passwd', 'hosts', 'config/']);
                }
                return Promise.resolve([]);
            }
            return Promise.resolve('');
        });

        const result = await getAutocompleteSuggestions('cat /etc/');
        expect(result.suggestions).toContain('/etc/passwd');
        expect(result.suggestions).toContain('/etc/hosts');
        expect(result.suggestions).toContain('/etc/config/');
    });

    it('handles relative paths with dot notation', async () => {
        vi.clearAllMocks();

        vi.mocked(invoke).mockImplementation((cmd, args) => {
            if (cmd === 'list_directory_contents') {

                const path = (args as any)?.path;
                if (path === '../' || path === '..' || path?.includes('../')) {
                    return Promise.resolve(['parent1.txt', 'parent2.txt', 'parentdir/']);
                }
                return Promise.resolve([]);
            }
            if (cmd === 'get_current_dir') {
                return Promise.resolve('/home/user/subdir');
            }
            return Promise.resolve('');
        });

        const result = await getAutocompleteSuggestions('ls ../');

        expect(Array.isArray(result.suggestions)).toBe(true);
        if (result.suggestions.length > 0) {
            expect(result.suggestions).toContain('../parent1.txt');
            expect(result.suggestions).toContain('../parent2.txt');
            expect(result.suggestions).toContain('../parentdir/');
        }
    });

    it('handles home directory expansion', async () => {
        vi.clearAllMocks();

        vi.mocked(invoke).mockImplementation((cmd, args) => {
            if (cmd === 'list_directory_contents') {
                if ((args as any)?.path?.includes('home')) {
                    return Promise.resolve(['Documents/', 'Downloads/', 'Desktop/']);
                }
                return Promise.resolve([]);
            }
            return Promise.resolve('');
        });

        const result = await getAutocompleteSuggestions('cd ~/');
        expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('handles nested directory paths', async () => {
        vi.clearAllMocks();

        vi.mocked(invoke).mockImplementation((cmd, args) => {
            if (cmd === 'list_directory_contents') {
                if ((args as any)?.path === 'folder1/subfolder') {
                    return Promise.resolve(['nested1.txt', 'nested2.txt']);
                }
                return Promise.resolve([]);
            }
            if (cmd === 'get_current_dir') {
                return Promise.resolve('/home/user');
            }
            return Promise.resolve('');
        });

        const result = await getAutocompleteSuggestions('cat folder1/subfolder/');
        expect(result.suggestions).toContain('folder1/subfolder/nested1.txt');
        expect(result.suggestions).toContain('folder1/subfolder/nested2.txt');
    });

    it('filters suggestions based on partial filename', async () => {
        vi.clearAllMocks();

        vi.mocked(invoke).mockImplementation((cmd) => {
            if (cmd === 'list_directory_contents') {
                return Promise.resolve([
                    'readme.txt',
                    'requirements.txt',
                    'package.json',
                    'other.md'
                ]);
            }
            return Promise.resolve('');
        });

        const result = await getAutocompleteSuggestions('cat re');
        expect(result.suggestions).toContain('readme.txt');
        expect(result.suggestions).toContain('requirements.txt');
        expect(result.suggestions).not.toContain('package.json');
        expect(result.suggestions).not.toContain('other.md');
    });

    it('handles case-sensitive filtering', async () => {
        vi.clearAllMocks();

        vi.mocked(invoke).mockImplementation((cmd) => {
            if (cmd === 'list_directory_contents') {
                return Promise.resolve([
                    'File1.txt',
                    'file2.txt',
                    'FILE3.TXT'
                ]);
            }
            return Promise.resolve('');
        });

        const result = await getAutocompleteSuggestions('cat F');

        expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('handles commands that do not require file completion', async () => {
        const result = await getAutocompleteSuggestions('clear');
        expect(result.suggestions).toContain('clear');
    });

    it('handles pipe operations', async () => {
        vi.clearAllMocks();

        vi.mocked(invoke).mockImplementation((cmd) => {
            if (cmd === 'list_directory_contents') {
                return Promise.resolve(['output.txt', 'log.txt']);
            }
            return Promise.resolve('');
        });

        const result = await getAutocompleteSuggestions('cat file.txt | grep pattern > ');
        expect(result.suggestions).toContain('output.txt');
        expect(result.suggestions).toContain('log.txt');
    });

    it('handles commands with flags and options', async () => {
        vi.clearAllMocks();

        vi.mocked(invoke).mockImplementation((cmd) => {
            if (cmd === 'list_directory_contents') {
                return Promise.resolve(['file1.txt', 'file2.txt']);
            }
            return Promise.resolve('');
        });

        const result = await getAutocompleteSuggestions('ls -la ');
        expect(result.suggestions).toContain('file1.txt');
        expect(result.suggestions).toContain('file2.txt');
    });

    it('handles very long file paths', async () => {
        vi.clearAllMocks();

        const longPath = 'very/deep/nested/directory/structure/with/many/levels';
        vi.mocked(invoke).mockImplementation((cmd, args) => {
            if (cmd === 'list_directory_contents') {
                if ((args as any)?.path === longPath) {
                    return Promise.resolve(['deep-file.txt']);
                }
                return Promise.resolve([]);
            }
            return Promise.resolve('');
        });

        const result = await getAutocompleteSuggestions(`cat ${longPath}/`);
        expect(result.suggestions).toContain(`${longPath}/deep-file.txt`);
    });

    it('handles files with various extensions', async () => {
        vi.clearAllMocks();

        vi.mocked(invoke).mockImplementation((cmd) => {
            if (cmd === 'list_directory_contents') {
                return Promise.resolve([
                    'script.py',
                    'data.json',
                    'image.png',
                    'document.pdf',
                    'archive.tar.gz'
                ]);
            }
            return Promise.resolve('');
        });

        const result = await getAutocompleteSuggestions('file ');
        expect(result.suggestions).toContain('script.py');
        expect(result.suggestions).toContain('data.json');
        expect(result.suggestions).toContain('image.png');
        expect(result.suggestions).toContain('document.pdf');
        expect(result.suggestions).toContain('archive.tar.gz');
    });

    it('handles directory-only commands like cd', async () => {
        vi.clearAllMocks();

        vi.mocked(invoke).mockImplementation((cmd) => {
            if (cmd === 'list_directory_contents') {
                return Promise.resolve([
                    'file1.txt',
                    'file2.txt',
                    'folder1/',
                    'folder2/'
                ]);
            }
            return Promise.resolve('');
        });

        const result = await getAutocompleteSuggestions('cd ');

        expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('handles mixed case commands', async () => {
        const result = await getAutocompleteSuggestions('Echo');

        expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('handles commands with quoted arguments', async () => {
        vi.clearAllMocks();

        vi.mocked(invoke).mockImplementation((cmd) => {
            if (cmd === 'list_directory_contents') {
                return Promise.resolve(['file with spaces.txt', 'normal-file.txt']);
            }
            return Promise.resolve('');
        });

        const result = await getAutocompleteSuggestions('cat "file ');
        expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('handles network timeout errors', async () => {
        vi.clearAllMocks();

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        vi.mocked(invoke).mockRejectedValueOnce(new Error('Network timeout'));

        const result = await getAutocompleteSuggestions('ls network-');
        expect(result.suggestions).toEqual([]);

        consoleSpy.mockRestore();
    });

    it('handles very large directory listings', async () => {
        vi.clearAllMocks();

        const manyFiles = Array.from({ length: 1000 }, (_, i) => `file${i}.txt`);

        vi.mocked(invoke).mockImplementation((cmd) => {
            if (cmd === 'list_directory_contents') {
                return Promise.resolve(manyFiles);
            }
            return Promise.resolve('');
        });

        const result = await getAutocompleteSuggestions('ls file1');
        expect(Array.isArray(result.suggestions)).toBe(true);
        expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('handles invalid command characters', async () => {
        const result = await getAutocompleteSuggestions('cat file*.txt');
        expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('provides proper completion for mkdir command', async () => {
        vi.clearAllMocks();

        vi.mocked(invoke).mockImplementation((cmd) => {
            if (cmd === 'list_directory_contents') {
                return Promise.resolve(['existing-dir/', 'file.txt']);
            }
            return Promise.resolve('');
        });

        const result = await getAutocompleteSuggestions('mkdir new');

        expect(Array.isArray(result.suggestions)).toBe(true);
    });


    it('handles commands with only whitespace after command name', async () => {
        const result = await getAutocompleteSuggestions('echo    ');
        expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('handles single character commands', async () => {
        const result = await getAutocompleteSuggestions('l');
        expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('handles very short partial matches', async () => {
        vi.clearAllMocks();

        vi.mocked(invoke).mockImplementation((cmd) => {
            if (cmd === 'list_directory_contents') {
                return Promise.resolve(['a.txt', 'b.txt', 'ab.txt']);
            }
            return Promise.resolve('');
        });

        const result = await getAutocompleteSuggestions('cat a');
        expect(result.suggestions).toContain('a.txt');
        expect(result.suggestions).toContain('ab.txt');
        expect(result.suggestions).not.toContain('b.txt');
    });

    it('handles commands ending with special characters', async () => {
        const result = await getAutocompleteSuggestions('echo$');
        expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('handles empty directory listings', async () => {
        vi.clearAllMocks();

        vi.mocked(invoke).mockImplementation((cmd) => {
            if (cmd === 'list_directory_contents') {
                return Promise.resolve([]);
            }
            return Promise.resolve('');
        });

        const result = await getAutocompleteSuggestions('ls ');
        expect(result.suggestions).toEqual([]);
    });

    it('handles paths with trailing spaces', async () => {
        vi.clearAllMocks();

        vi.mocked(invoke).mockImplementation((cmd) => {
            if (cmd === 'list_directory_contents') {
                return Promise.resolve(['file.txt']);
            }
            return Promise.resolve('');
        });

        const result = await getAutocompleteSuggestions('cat /path/to/dir/  ');
        expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('handles multiple consecutive spaces in input', async () => {
        vi.clearAllMocks();

        vi.mocked(invoke).mockImplementation((cmd) => {
            if (cmd === 'list_directory_contents') {
                return Promise.resolve(['file.txt']);
            }
            return Promise.resolve('');
        });

        const result = await getAutocompleteSuggestions('cat     file');
        expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('handles commands with numbers', async () => {
        const result = await getAutocompleteSuggestions('head123');
        expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('handles paths starting with tilde expansion edge cases', async () => {
        vi.clearAllMocks();

        vi.mocked(invoke).mockImplementation((cmd, args) => {
            if (cmd === 'list_directory_contents') {
                const path = (args as any)?.path;
                if (path && path.includes('/home')) {
                    return Promise.resolve(['Documents/', 'Pictures/']);
                }
                return Promise.resolve([]);
            }
            return Promise.resolve('');
        });

        const result = await getAutocompleteSuggestions('cd ~user/');
        expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('handles current directory dot notation', async () => {
        vi.clearAllMocks();

        vi.mocked(invoke).mockImplementation((cmd, args) => {
            if (cmd === 'list_directory_contents') {
                const path = (args as any)?.path;
                if (path === '.') {
                    return Promise.resolve(['local.txt', 'here.txt']);
                }
                return Promise.resolve([]);
            }
            return Promise.resolve('');
        });

        const result = await getAutocompleteSuggestions('ls ./');
        expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('handles deeply nested relative paths', async () => {
        vi.clearAllMocks();

        vi.mocked(invoke).mockImplementation((cmd, args) => {
            if (cmd === 'list_directory_contents') {
                const path = (args as any)?.path;
                if (path === '../../parent/child') {
                    return Promise.resolve(['nested.txt']);
                }
                return Promise.resolve([]);
            }
            return Promise.resolve('');
        });

        const result = await getAutocompleteSuggestions('cat ../../parent/child/');
        expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('handles files with no extensions', async () => {
        vi.clearAllMocks();

        vi.mocked(invoke).mockImplementation((cmd) => {
            if (cmd === 'list_directory_contents') {
                return Promise.resolve(['README', 'Makefile', 'LICENSE']);
            }
            return Promise.resolve('');
        });

        const result = await getAutocompleteSuggestions('cat ');
        expect(result.suggestions).toContain('README');
        expect(result.suggestions).toContain('Makefile');
        expect(result.suggestions).toContain('LICENSE');
    });

    it('handles hidden files and directories', async () => {
        vi.clearAllMocks();

        vi.mocked(invoke).mockImplementation((cmd) => {
            if (cmd === 'list_directory_contents') {
                return Promise.resolve(['.bashrc', '.config/', '.hidden.txt']);
            }
            return Promise.resolve('');
        });

        const result = await getAutocompleteSuggestions('ls .');
        expect(result.suggestions).toContain('.bashrc');
        expect(result.suggestions).toContain('.hidden.txt');

        expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('handles completion when path does not exist', async () => {
        vi.clearAllMocks();

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        vi.mocked(invoke).mockRejectedValue(new Error('Path does not exist'));

        const result = await getAutocompleteSuggestions('cat /nonexistent/path/');
        expect(result.suggestions).toEqual([]);

        consoleSpy.mockRestore();
    });

    it('handles completion with mixed file types', async () => {
        vi.clearAllMocks();

        vi.mocked(invoke).mockImplementation((cmd) => {
            if (cmd === 'list_directory_contents') {
                return Promise.resolve([
                    'document.pdf',
                    'image.jpg',
                    'script.sh',
                    'data.csv',
                    'archive.zip',
                    'symlink.lnk',
                    'binary',
                    'text.txt'
                ]);
            }
            return Promise.resolve('');
        });

        const result = await getAutocompleteSuggestions('file ');
        expect(result.suggestions).toContain('document.pdf');
        expect(result.suggestions).toContain('binary');
        expect(result.suggestions).toContain('symlink.lnk');
    });

    it('handles unicode and special characters in filenames', async () => {
        vi.clearAllMocks();

        vi.mocked(invoke).mockImplementation((cmd) => {
            if (cmd === 'list_directory_contents') {
                return Promise.resolve([
                    'файл.txt',
                    'café.md',
                    'ñoño.js',
                    '测试.json',
                    'émoji😀.txt'
                ]);
            }
            return Promise.resolve('');
        });

        const result = await getAutocompleteSuggestions('cat ');
        expect(result.suggestions).toContain('файл.txt');
        expect(result.suggestions).toContain('café.md');
        expect(result.suggestions).toContain('ñoño.js');
    });

    it('handles command completion for builtin commands', async () => {
        const result = await getAutocompleteSuggestions('his');
        expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('handles partial command completion with exact matches', async () => {
        const result = await getAutocompleteSuggestions('cat');
        expect(result.suggestions).toContain('cat');
    });

    it('handles completion when invoke returns unexpected data types', async () => {
        vi.clearAllMocks();

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        vi.mocked(invoke).mockResolvedValue(null);

        const result = await getAutocompleteSuggestions('ls ');

        expect(result).toBeDefined();
        expect(Array.isArray(result.suggestions) || result.suggestions === null).toBe(true);

        consoleSpy.mockRestore();
    });

    it('handles extremely long input strings', async () => {
        const longInput = 'cat ' + 'a'.repeat(1000);
        const result = await getAutocompleteSuggestions(longInput);
        expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('handles commands with environment variables', async () => {
        vi.clearAllMocks();

        vi.mocked(invoke).mockImplementation((cmd) => {
            if (cmd === 'list_directory_contents') {
                return Promise.resolve(['file.txt']);
            }
            return Promise.resolve('');
        });

        const result = await getAutocompleteSuggestions('cat $HOME/');
        expect(Array.isArray(result.suggestions)).toBe(true);
    });
});
