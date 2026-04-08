import { describe, it, expect } from 'vitest';
import { filesOfProject } from 'tsarch';

const viewmodelRoots = [
	'src/app/app/viewmodel',
	'src/app/catalog/viewmodel',
	'src/app/template/viewmodel',
	'src/app/theme/viewmodel',
] as const;

describe('viewmodel architecture', () => {
	for (const folder of viewmodelRoots) {
		it(`${folder} should not depend on domain/controllers`, async () => {
			let rule = filesOfProject().inFolder(folder);
			if (folder === 'src/app/app/viewmodel') {
				rule = rule.matchingPattern(
					'^(?!src/app/app/viewmodel/use-app-shell-viewmodel).*',
				);
			}
			const violations = await rule.shouldNot().dependOnFiles().inFolder('src/domain/controllers').check();
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

		it(`${folder} should not depend on gateway`, async () => {
			const rule = filesOfProject()
				.inFolder(folder)
				.shouldNot()
				.dependOnFiles()
				.inFolder('src/gateway');
			const violations = await rule.check();
			expect(violations).toHaveLength(0);
		});
	}
});
