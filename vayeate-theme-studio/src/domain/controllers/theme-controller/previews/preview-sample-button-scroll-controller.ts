import { singleton } from 'tsyringe';

/** No-op; used to scroll preview windows (THEME_PREVIEW_SAMPLE_BUTTON_ON_CLICK). */
@singleton()
export class PreviewSampleButtonScrollController {
  run(): void {}
}
