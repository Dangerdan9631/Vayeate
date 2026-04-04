import { describe, it, expect } from 'vitest';
import { filesOfProject } from 'tsarch';

const featureComponentRoots = [
	'src/app/app/components',
	'src/app/catalog/components',
	'src/app/common/components',
	'src/app/template/components',
	'src/app/theme/components',
] as const;

describe('app architecture', () => {
	it('only AppContext and App shell should depend on controllers', async () => {
		const rule = filesOfProject()
			.inFolder('src/app')
			.matchingPattern(
				'^(?!src/app/app/context/AppContext)(?!src/app/app/components/App).*',
			)
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

	for (const folder of featureComponentRoots) {
		it(`${folder} should not depend on domain/controllers`, async () => {
			const rule = filesOfProject()
				.inFolder(folder)
				.shouldNot()
				.dependOnFiles()
				.inFolder('src/domain/controllers');
			const violations = await rule.check();
			expect(violations).toHaveLength(0);
		});

		it(`${folder} should not depend on domain/operations`, async () => {
			const rule = filesOfProject()
				.inFolder(folder)
				.shouldNot()
				.dependOnFiles()
				.inFolder('src/domain/operations');
			const violations = await rule.check();
			expect(violations).toHaveLength(0);
		});
	}
});
