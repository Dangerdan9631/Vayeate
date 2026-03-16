import { describe, it, expect } from 'vitest';
import { filesOfProject } from 'tsarch';

describe('domain architecture', () => {
	it('domain should not depend on app', async () => {
		const rule = filesOfProject()
			.inFolder('src/domain')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/app');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('only operations should depend on gateway', async () => {
		const rule = filesOfProject()
			.inFolder('src/domain')
			.matchingPattern('^(?!src/domain/operations/).*')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/gateway');
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

	it('operations should not depend on domain/controllers', async () => {
		const rule = filesOfProject()
			.inFolder('src/domain/operations')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/domain/controllers');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('only controllers should depend on operations', async () => {
		const rule = filesOfProject()
			.matchingPattern('^(?!src/domain/controllers/).*')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/domain/operations');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('state should only depend on model', async () => {
		const rule = filesOfProject()
			.inFolder('src/domain/state')
			.shouldNot()
			.dependOnFiles()
			.matchingPattern('^(?!src/model).*');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('domain/controllers should not depend on gateway', async () => {
		const rule = filesOfProject()
			.inFolder('src/domain/controllers')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/gateway');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('domain/controllers should not depend on app', async () => {
		const rule = filesOfProject()
			.inFolder('src/domain/controllers')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/app');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('domain/controllers should not depend on domain/core', async () => {
		const rule = filesOfProject()
			.inFolder('src/domain/controllers')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/domain/core');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('domain/utils should not depend on domain/operations', async () => {
		const rule = filesOfProject()
			.inFolder('src/domain/utils')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/domain/operations');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('domain/utils should not depend on domain/controllers', async () => {
		const rule = filesOfProject()
			.inFolder('src/domain/utils')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/domain/controllers');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('domain/utils should not depend on domain/core', async () => {
		const rule = filesOfProject()
			.inFolder('src/domain/utils')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/domain/core');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('domain/validations should not depend on domain/operations', async () => {
		const rule = filesOfProject()
			.inFolder('src/domain/validations')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/domain/operations');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('domain/validations should not depend on domain/controllers', async () => {
		const rule = filesOfProject()
			.inFolder('src/domain/validations')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/domain/controllers');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});
});

