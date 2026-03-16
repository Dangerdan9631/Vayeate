import { describe, it, expect } from 'vitest';
import { filesOfProject } from 'tsarch';

describe('viewmodel architecture', () => {
	it('app/viewmodel should not depend on domain/controllers', async () => {
		const rule = filesOfProject()
			.inFolder('src/app/viewmodel')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/domain/controllers');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('app/viewmodel should not depend on domain/operations', async () => {
		const rule = filesOfProject()
			.inFolder('src/app/viewmodel')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/domain/operations');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('app/viewmodel should not depend on gateway', async () => {
		const rule = filesOfProject()
			.inFolder('src/app/viewmodel')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/gateway');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});
});
