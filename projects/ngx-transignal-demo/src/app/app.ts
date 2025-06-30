import { ChangeDetectionStrategy, Component } from '@angular/core';
import { transignal } from './transignal';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected transignalService = transignal.service();

  protected t = transignal.t('home');

  switchLanguage() {
    const activeLang = this.transignalService.activeLang();
    this.transignalService.setActiveLang(activeLang === 'fr' ? 'en' : 'fr');
  }
}
