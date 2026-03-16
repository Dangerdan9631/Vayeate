import { describe, it, expect } from 'vitest';
import { filesOfProject } from 'tsarch';

describe('handler architecture', () => {
	it('handlers should not depend on domain/operations', async () => {
		const rule = filesOfProject()
			.inFolder('src/app/handlers')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/domain/operations');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('handlers should not depend on gateway', async () => {
		const rule = filesOfProject()
			.inFolder('src/app/handlers')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/gateway');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('handlers should not depend on domain/validations', async () => {
		const rule = filesOfProject()
			.inFolder('src/app/handlers')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/domain/validations');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});
});
