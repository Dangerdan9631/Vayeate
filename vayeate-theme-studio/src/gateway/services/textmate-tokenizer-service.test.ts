import { describe, expect, it, vi } from 'vitest';
import * as scheduler from '../../domain/core/scheduler';
import type { IRawGrammar } from 'vscode-textmate';
import { TextmateTokenizerService } from './textmate-tokenizer-service';

const mockGrammar = {
  tokenizeLine: vi.fn((lineText: string, ruleStack: unknown) => ({
    tokens: [{ startIndex: 0, endIndex: lineText.length, scopes: ['keyword'] }],
    ruleStack,
  })),
  dispose: vi.fn(),
};

vi.mock('vscode-textmate', () => ({
  Registry: class MockRegistry {
    loadGrammar = vi.fn(async () => mockGrammar);
  },
}));

describe('TextmateTokenizerService tokenizeFile yielding', () => {
  it('yields while tokenizing multi-line source', async () => {
    const yieldGate = vi.fn(async () => {});
    const yieldEverySpy = vi.spyOn(scheduler, 'yieldEvery').mockReturnValue(yieldGate);

    const service = new TextmateTokenizerService();
    (service as unknown as { onigurumaReady: Promise<unknown> }).onigurumaReady = Promise.resolve({
      createOnigScanner: vi.fn(),
      createOnigString: vi.fn(),
    });

    const grammar = {
      scopeName: 'source.test',
      repository: { $self: {}, $base: {} },
      patterns: [],
    } as IRawGrammar;
    const sourceCode = ['line one', 'line two', 'line three'].join('\n');
    await service.tokenizeFile(grammar, sourceCode);

    expect(yieldEverySpy).toHaveBeenCalledWith(scheduler.DEFERRED_WORK_YIELD_INTERVAL);
    expect(yieldGate).toHaveBeenCalledTimes(3);

    yieldEverySpy.mockRestore();
  });
});
