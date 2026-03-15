import { describe, it, expect } from 'vitest';
import { filesOfProject } from 'tsarch';

describe('architecture (cycle)', () => {
	it('src should be cycle free', async () => {
		const rule = filesOfProject()
			.inFolder('src')
			.should()
			.beFreeOfCycles();
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});
});
