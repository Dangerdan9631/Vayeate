import { describe, it, expect } from 'vitest';
import { filesOfProject } from 'tsarch';

describe('gateway architecture', () => {
	it('gateway should not depend on domain', async () => {
		const rule = filesOfProject()
			.inFolder('src/gateway')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/domain');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('gateway should not depend on app', async () => {
		const rule = filesOfProject()
			.inFolder('src/gateway')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/app');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('gateway/data should not depend on gateway/services', async () => {
		const rule = filesOfProject()
			.inFolder('src/gateway/data')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/gateway/services');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('gateway/services should not depend on gateway/data', async () => {
		const rule = filesOfProject()
			.inFolder('src/gateway/services')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/gateway/data');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});
});
