import { describe, it, expect } from 'vitest';
import { parseInput } from '../utils/intentParser';

describe('Intent Parser', () => {
  it('parses basic commands correctly', () => {
    const result = parseInput('ls -la');
    expect(result.type).toBe('system_command');
    if (result.type === 'system_command') {
      expect(result.command).toBe('ls -la');
    }
  });

  it('parses cd commands correctly', () => {
    const result = parseInput('cd /home/user');
    expect(result.type).toBe('system_command');
    if (result.type === 'system_command') {
      expect(result.command).toBe('cd /home/user');
    }
  });

  it('parses cat commands correctly', () => {
    const result = parseInput('cat file.txt');
    expect(result.type).toBe('file_view');
    if (result.type === 'file_view') {

      expect(result).toHaveProperty('filename', 'file.txt');
    }
  });

  it('handles empty input', () => {
    const result = parseInput('');
    expect(result.type).toBe('unknown');

  });

  it('handles commands with multiple arguments', () => {
    const result = parseInput('grep -r "pattern" /path/to/files');
    expect(result.type).toBe('system_command');
    if (result.type === 'system_command') {
      expect(result.command).toBe('grep -r "pattern" /path/to/files');
    }
  });
});
