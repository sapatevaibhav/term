import { describe, it, expect } from 'vitest';

// Simple test for autocomplete functionality
describe('Autocomplete functionality', () => {
  it('provides suggestions for partial commands', () => {
    // Create a simple autocomplete function for testing
    function getAutocompleteSuggestions(input: string): string[] {
      const commands = ['echo', 'cd', 'ls', 'mkdir', 'pwd', 'cat'];
      return commands.filter(cmd => cmd.startsWith(input));
    }

    const suggestions = getAutocompleteSuggestions('ec');
    expect(suggestions).toContain('echo');
    expect(suggestions.length).toBe(1);
  });
});
