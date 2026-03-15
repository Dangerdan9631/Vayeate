import { describe, it, expect } from 'vitest';
import { filesOfProject } from 'tsarch';

describe('app architecture', () => {
	it('only AppContext should depend on controllers', async () => {
		const rule = filesOfProject()
			.inFolder('src/app')
			.matchingPattern('^(?!src/app/context/AppContext).*')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/domain/controllers');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('app should not depend on gateway', async () => {
		const rule = filesOfProject()
			.inFolder('src/app')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/gateway');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});
});
