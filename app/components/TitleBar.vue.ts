import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import electron from 'electron';
import { CustomizationService } from 'services/customization';
import { Inject } from 'services/core/injector';
import { StreamingService } from 'services/streaming';
import Utils from 'services/utils';
import { $t } from 'services/i18n';

@Component({})
export default class TitleBar extends Vue {
  @Inject() customizationService: CustomizationService;
  @Inject() streamingService: StreamingService;

  @Prop() title: string;

  minimize() {
    electron.remote.getCurrentWindow().minimize();
  }

  unmaximizeBounds: electron.Rectangle;

  maximize() {
    const win = electron.remote.getCurrentWindow();

    // WIN 7 BEHAVIOR
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

    // NORMAL BEHAVIOR
    // if (win.isMaximized()) {
    //   win.unmaximize();
    // } else {
    //   win.maximize();
    // }
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
