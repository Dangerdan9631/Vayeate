import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { container } from 'tsyringe';
import type { Template } from '../../../model/schemas';
import { TemplateGateway } from '../../../gateway/template/template-gateway';
import {
  LoadTemplateRefsOperation,
  createTemplate,
  deleteTemplate,
  loadTemplate,
  refreshTemplateRefs,
  saveTemplate,
} from '.';
import { TemplatesStateSetter } from '../../state/template/templates-state-reducer';

const templateGatewayMock = {
  createTemplate: vi.fn(),
  saveTemplate: vi.fn(),
  loadTemplate: vi.fn(),
  listTemplates: vi.fn(),
  deleteTemplate: vi.fn(),
};

describe('template-operations', () => {
  beforeEach(() => {
    container.registerInstance(TemplateGateway, templateGatewayMock as unknown as TemplateGateway);
    vi.mocked(templateGatewayMock.createTemplate).mockResolvedValue({ name: 't1', version: '1.0.0' } as Template);
    vi.mocked(templateGatewayMock.saveTemplate).mockResolvedValue(undefined);
    vi.mocked(templateGatewayMock.loadTemplate).mockResolvedValue({ name: 't1', version: '1.0.0' } as Template);
    vi.mocked(templateGatewayMock.listTemplates).mockResolvedValue([{ name: 't1', version: '1.0.0' }]);
    vi.mocked(templateGatewayMock.deleteTemplate).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('createTemplate calls templateGateway.createTemplate and returns template', async () => {
    const setState = vi.fn();
    const result = await createTemplate(setState, { name: 't1' });

    expect(templateGatewayMock.createTemplate).toHaveBeenCalledTimes(1);
    expect(templateGatewayMock.createTemplate).toHaveBeenCalledWith({ name: 't1' });
    expect(result).toEqual({ name: 't1', version: '1.0.0' });
  });

  it('LoadTemplateRefsOperation.execute sets store entries from listTemplates result', async () => {
    const setStoreState = vi.fn();
    const op = new LoadTemplateRefsOperation(new TemplatesStateSetter(setStoreState), container.resolve(TemplateGateway));

    await op.execute();

    expect(templateGatewayMock.listTemplates).toHaveBeenCalledTimes(1);
    expect(setStoreState).toHaveBeenCalledWith({
      type: 'SET_TEMPLATE_MAP_ENTRIES',
      entries: [{ name: 't1', version: '1.0.0', isLoaded: false, template: undefined }],
    });
  });

  it('loadTemplate loads a template and updates state', async () => {
    const setState = vi.fn();

    const loaded = await loadTemplate(setState, 't1', '1.0.0');

    expect(templateGatewayMock.loadTemplate).toHaveBeenCalledTimes(1);
    expect(templateGatewayMock.loadTemplate).toHaveBeenCalledWith('t1', '1.0.0');
    expect(setState).toHaveBeenCalledWith({
      type: 'SET_TEMPLATE',
      template: { name: 't1', version: '1.0.0' },
    });
    expect(loaded).toEqual({ name: 't1', version: '1.0.0' });
  });

  it('saveTemplate calls templateGateway.saveTemplate', async () => {
    const template = { name: 't1', version: '1.0.0' } as Template;

    await saveTemplate(template);

    expect(templateGatewayMock.saveTemplate).toHaveBeenCalledTimes(1);
    expect(templateGatewayMock.saveTemplate).toHaveBeenCalledWith(template);
  });

  it('deleteTemplate calls templateGateway.deleteTemplate', async () => {
    await deleteTemplate('t1', '1.0.0');

    expect(templateGatewayMock.deleteTemplate).toHaveBeenCalledTimes(1);
    expect(templateGatewayMock.deleteTemplate).toHaveBeenCalledWith('t1', '1.0.0');
  });

  it('refreshTemplateRefs returns refs and sets store entries', async () => {
    const setStoreState = vi.fn();

    const refs = await refreshTemplateRefs(setStoreState);

    expect(templateGatewayMock.listTemplates).toHaveBeenCalledTimes(1);
    expect(setStoreState).toHaveBeenCalledWith({
      type: 'SET_TEMPLATE_MAP_ENTRIES',
      entries: [{ name: 't1', version: '1.0.0', isLoaded: false, template: undefined }],
    });
    expect(refs).toEqual([{ name: 't1', version: '1.0.0' }]);
  });
});
