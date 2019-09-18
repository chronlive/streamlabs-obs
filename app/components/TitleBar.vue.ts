import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import electron from 'electron';
import { CustomizationService } from 'services/customization';
import { Inject } from 'services/core/injector';
import { StreamingService } from 'services/streaming';
import Utils from 'services/utils';
import { $t } from 'services/i18n';
import os from 'os';

@Component({})
export default class TitleBar extends Vue {
  @Inject() customizationService: CustomizationService;
  @Inject() streamingService: StreamingService;

  @Prop() title: string;

  minimize() {
    electron.remote.getCurrentWindow().minimize();
  }

  unmaximizeBounds: electron.Rectangle;

  get isMaximizable() {
    return Utils.isMainWindow() || electron.remote.getCurrentWindow().isMaximizable() !== false;
  }

  maximize() {
    const win = electron.remote.getCurrentWindow();

    // This special behavior is required for windows 7 because of a bug
    // where the display disappears when maximized. (Windows 7 is version 6)
    if (os.platform() === 'win32' && os.release()[0] === '6') {
      if (this.unmaximizeBounds) {
        win.setBounds(this.unmaximizeBounds);
        this.unmaximizeBounds = null;
      } else {
        this.unmaximizeBounds = win.getBounds();
        const display = electron.remote.screen.getDisplayMatching(this.unmaximizeBounds);
        win.setBounds(display.bounds);

        win.once('resize', () => {
          this.unmaximizeBounds = null;
        });
      }
    } else {
      // Normal behavior for Win 8+
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  }

  close() {
    if (Utils.isMainWindow() && this.streamingService.isStreaming) {
      if (!confirm($t('Are you sure you want to exit while live?'))) return;
    }

    electron.remote.getCurrentWindow().close();
  }

  get theme() {
    return this.customizationService.currentTheme;
  }
}
