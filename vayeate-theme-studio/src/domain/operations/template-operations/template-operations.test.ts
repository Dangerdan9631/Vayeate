import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { container } from 'tsyringe';
import type { Template } from '../../../model/schemas';
import { TemplateService } from '../../../gateway/services/template-service';
import {
  LoadTemplateRefs,
  createTemplate,
  deleteTemplate,
  loadTemplate,
  refreshTemplateRefs,
  saveTemplate,
} from '.';
import { StoreStateSetter } from '../../state/store-state-setter';

const templateServiceMock = {
  createTemplate: vi.fn(),
  saveTemplate: vi.fn(),
  loadTemplate: vi.fn(),
  listTemplates: vi.fn(),
  deleteTemplate: vi.fn(),
};

describe('template-operations', () => {
  beforeEach(() => {
    container.registerInstance(TemplateService, templateServiceMock as unknown as TemplateService);
    vi.mocked(templateServiceMock.createTemplate).mockResolvedValue({ name: 't1', version: '1.0.0' } as Template);
    vi.mocked(templateServiceMock.saveTemplate).mockResolvedValue(undefined);
    vi.mocked(templateServiceMock.loadTemplate).mockResolvedValue({ name: 't1', version: '1.0.0' } as Template);
    vi.mocked(templateServiceMock.listTemplates).mockResolvedValue([{ name: 't1', version: '1.0.0' }]);
    vi.mocked(templateServiceMock.deleteTemplate).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('createTemplate calls templateService.createTemplate and returns template', async () => {
    const setState = vi.fn();
    const result = await createTemplate(setState, { name: 't1' });

    expect(templateServiceMock.createTemplate).toHaveBeenCalledTimes(1);
    expect(templateServiceMock.createTemplate).toHaveBeenCalledWith({ name: 't1' });
    expect(result).toEqual({ name: 't1', version: '1.0.0' });
  });

  it('LoadTemplateRefs.execute sets store entries from listTemplates result', async () => {
    const setStoreState = vi.fn();
    const op = new LoadTemplateRefs(new StoreStateSetter(setStoreState), container.resolve(TemplateService));

    await op.execute();

    expect(templateServiceMock.listTemplates).toHaveBeenCalledTimes(1);
    expect(setStoreState).toHaveBeenCalledWith({
      type: 'SET_STORE_TEMPLATE_ENTRIES',
      entries: [{ name: 't1', version: '1.0.0', isLoaded: false, template: undefined }],
    });
  });

  it('loadTemplate loads a template and updates state', async () => {
    const setState = vi.fn();

    const loaded = await loadTemplate(setState, 't1', '1.0.0');

    expect(templateServiceMock.loadTemplate).toHaveBeenCalledTimes(1);
    expect(templateServiceMock.loadTemplate).toHaveBeenCalledWith('t1', '1.0.0');
    expect(setState).toHaveBeenCalledWith({
      type: 'SET_TEMPLATE',
      template: { name: 't1', version: '1.0.0' },
    });
    expect(loaded).toEqual({ name: 't1', version: '1.0.0' });
  });

  it('saveTemplate calls templateService.saveTemplate', async () => {
    const template = { name: 't1', version: '1.0.0' } as Template;

    await saveTemplate(template);

    expect(templateServiceMock.saveTemplate).toHaveBeenCalledTimes(1);
    expect(templateServiceMock.saveTemplate).toHaveBeenCalledWith(template);
  });

  it('deleteTemplate calls templateService.deleteTemplate', async () => {
    await deleteTemplate('t1', '1.0.0');

    expect(templateServiceMock.deleteTemplate).toHaveBeenCalledTimes(1);
    expect(templateServiceMock.deleteTemplate).toHaveBeenCalledWith('t1', '1.0.0');
  });

  it('refreshTemplateRefs returns refs and sets store entries', async () => {
    const setStoreState = vi.fn();

    const refs = await refreshTemplateRefs(setStoreState);

    expect(templateServiceMock.listTemplates).toHaveBeenCalledTimes(1);
    expect(setStoreState).toHaveBeenCalledWith({
      type: 'SET_STORE_TEMPLATE_ENTRIES',
      entries: [{ name: 't1', version: '1.0.0', isLoaded: false, template: undefined }],
    });
    expect(refs).toEqual([{ name: 't1', version: '1.0.0' }]);
  });
});
