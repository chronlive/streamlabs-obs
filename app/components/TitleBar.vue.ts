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

  mounted() {
    electron.remote.getCurrentWindow().on('maximize', () => {
      console.log('GOT MAXIMIZE');
      const win = electron.remote.getCurrentWindow();
      const currentDisplay = electron.remote.screen.getDisplayMatching(win.getBounds());

      win.setBounds(currentDisplay.bounds);
    });
  }

  minimize() {
    electron.remote.getCurrentWindow().minimize();
  }

  get isMaximizable() {
    return electron.remote.getCurrentWindow().isMaximizable() !== false;
  }

  unmaximizedSize: electron.Rectangle;

  maximize() {
    const win = electron.remote.getCurrentWindow();

    // WINDOWS 7 FAKE MAXIMIZE MODE
    // if (!this.unmaximizedSize) {

    // }

    // const currentDisplay = electron.remote.screen.getDisplayMatching(win.getBounds());

    // win.setBounds(currentDisplay.bounds);

    // NORMAL MODE
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
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
