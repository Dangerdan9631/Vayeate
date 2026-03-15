import { describe, it, expect } from 'vitest';
import { filesOfProject } from 'tsarch';

describe('model architecture', () => {
	it('model should only depend on model', async () => {
		const rule = filesOfProject()
			.inFolder('src/model')
			.shouldNot()
			.dependOnFiles()
			.matchingPattern('^(?!src/model/).*');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});
});
