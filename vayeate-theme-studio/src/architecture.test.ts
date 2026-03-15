import { describe, it, expect } from 'vitest';
import { filesOfProject } from 'tsarch';

describe('architecture', () => {
	it('src should be cycle free', async () => {
		const rule = filesOfProject()
			.inFolder('src')
			.should()
			.beFreeOfCycles();
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('domain should not depend on app', async () => {
		const rule = filesOfProject()
			.inFolder('src/domain')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/app');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('UI components should not depend on controllers', async () => {
		const rule = filesOfProject()
			.inFolder('src/app/ui/components')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/domain/controllers');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('UI components should not depend on operations', async () => {
		const rule = filesOfProject()
			.inFolder('src/app/ui/components')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/domain/operations');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('UI pages should not depend on controllers', async () => {
		const rule = filesOfProject()
			.inFolder('src/app/ui/pages')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/domain/controllers');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('UI pages should not depend on operations', async () => {
		const rule = filesOfProject()
			.inFolder('src/app/ui/pages')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/domain/operations');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('viewmodel should not depend on controllers', async () => {
		const rule = filesOfProject()
			.inFolder('src/app/viewmodel')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/domain/controllers');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('viewmodel should not depend on operations', async () => {
		const rule = filesOfProject()
			.inFolder('src/app/viewmodel')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/domain/operations');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('viewmodel should not depend on gateway', async () => {
		const rule = filesOfProject()
			.inFolder('src/app/viewmodel')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/gateway');
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

	it('controllers should not depend on data', async () => {
		const rule = filesOfProject()
			.inFolder('src/domain/controllers')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/gateway/data');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('operations should not depend on data', async () => {
		const rule = filesOfProject()
			.inFolder('src/domain/operations')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/gateway/data');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('operations should not depend on other operations', async () => {
		const rule = filesOfProject()
			.inFolder('src/domain/operations')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/domain/operations');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('gateway should not depend on domain', async () => {
		const rule = filesOfProject()
			.inFolder('src/gateway')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/domain');
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

	it('state should not depend on controllers', async () => {
		const rule = filesOfProject()
			.inFolder('src/domain/state')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/domain/controllers');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('state should not depend on operations', async () => {
		const rule = filesOfProject()
			.inFolder('src/domain/state')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/domain/operations');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('state should not depend on data', async () => {
		const rule = filesOfProject()
			.inFolder('src/domain/state')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/gateway/data');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('model should not depend on app', async () => {
		const rule = filesOfProject()
			.inFolder('src/model')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/app');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('model should not depend on domain', async () => {
		const rule = filesOfProject()
			.inFolder('src/model')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/domain');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('model should not depend on gateway', async () => {
		const rule = filesOfProject()
			.inFolder('src/model')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/gateway');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});
});
