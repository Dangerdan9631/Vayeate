import * as z from 'zod';

export const tabIdSchema = z.enum(['catalogs', 'templates', 'themes']);
export type TabId = z.infer<typeof tabIdSchema>;
