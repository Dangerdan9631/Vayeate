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

	it('UI components should not depend on controllers', async () => {
		const rule = filesOfProject()
			.inFolder('src/app/ui/components')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/controllers');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('UI components should not depend on operations', async () => {
		const rule = filesOfProject()
			.inFolder('src/app/ui/components')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/operations');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('UI pages should not depend on controllers', async () => {
		const rule = filesOfProject()
			.inFolder('src/app/ui/pages')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/controllers');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('UI pages should not depend on operations', async () => {
		const rule = filesOfProject()
			.inFolder('src/app/ui/pages')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/operations');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('viewmodel should not depend on controllers', async () => {
		const rule = filesOfProject()
			.inFolder('src/app/viewmodel')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/controllers');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('viewmodel should not depend on operations', async () => {
		const rule = filesOfProject()
			.inFolder('src/app/viewmodel')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/operations');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('viewmodel should not depend on data', async () => {
		const rule = filesOfProject()
			.inFolder('src/app/viewmodel')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/data');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('app should not depend on data', async () => {
		const rule = filesOfProject()
			.inFolder('src/app')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/data');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('controllers should not depend on data', async () => {
		const rule = filesOfProject()
			.inFolder('src/controllers')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/data');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('operations should not depend on data', async () => {
		const rule = filesOfProject()
			.inFolder('src/operations')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/data');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('operations should not depend on other operations', async () => {
		const rule = filesOfProject()
			.inFolder('src/operations')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/operations');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('services should not depend on data', async () => {
		const rule = filesOfProject()
			.inFolder('src/services')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/data');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('state should not depend on controllers', async () => {
		const rule = filesOfProject()
			.inFolder('src/state')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/controllers');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('state should not depend on operations', async () => {
		const rule = filesOfProject()
			.inFolder('src/state')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/operations');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('state should not depend on data', async () => {
		const rule = filesOfProject()
			.inFolder('src/state')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/data');
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

	it('model should not depend on controllers', async () => {
		const rule = filesOfProject()
			.inFolder('src/model')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/controllers');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('model should not depend on operations', async () => {
		const rule = filesOfProject()
			.inFolder('src/model')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/operations');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('model should not depend on services', async () => {
		const rule = filesOfProject()
			.inFolder('src/model')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/services');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('model should not depend on state', async () => {
		const rule = filesOfProject()
			.inFolder('src/model')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/state');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('model should not depend on data', async () => {
		const rule = filesOfProject()
			.inFolder('src/model')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/data');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});
});
