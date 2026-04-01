import { describe, it, expect } from 'vitest';
import { filesOfProject } from 'tsarch';

describe('app architecture', () => {
	it('only AppContext and App shell should depend on controllers', async () => {
		const rule = filesOfProject()
			.inFolder('src/app')
			.matchingPattern('^(?!src/app/ui/context/AppContext)(?!src/app/ui/App).*')
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

	it('app/ui/components should not depend on domain/controllers', async () => {
		const rule = filesOfProject()
			.inFolder('src/app/ui/components')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/domain/controllers');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});

	it('app/ui/components should not depend on domain/operations', async () => {
		const rule = filesOfProject()
			.inFolder('src/app/ui/components')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/domain/operations');
		const violations = await rule.check();
		expect(violations).toHaveLength(0);
	});
});


