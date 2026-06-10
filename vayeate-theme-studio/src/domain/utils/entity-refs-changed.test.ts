import { describe, expect, it } from 'vitest';
import { entityRefsChanged } from './entity-refs-changed';

describe('entityRefsChanged', () => {
  it('is false when name and version are unchanged', () => {
    expect(entityRefsChanged(
      { name: 'a', version: '1.0.0' },
      { name: 'a', version: '1.0.0' },
    )).toBe(false);
  });

  it('is true when version changes', () => {
    expect(entityRefsChanged(
      { name: 'a', version: '1.0.0' },
      { name: 'a', version: '1.0.1' },
    )).toBe(true);
  });

  it('is true when name changes', () => {
    expect(entityRefsChanged(
      { name: 'a', version: '1.0.0' },
      { name: 'b', version: '1.0.0' },
    )).toBe(true);
  });
});
