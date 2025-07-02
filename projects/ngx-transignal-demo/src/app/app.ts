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
  protected isLoading = this.transignalService.isLoading;

  switchLanguage() {
    const activeLang = this.transignalService.activeLang();
    this.transignalService.activeLang.set(activeLang === 'fr' ? 'en' : 'fr');
  }

  example() {
    this.t.plural('plural.users', 2);
    this.t.obj('homeNested.blocks');
    this.t.arr('array');
    this.t('homeNested.blocks.something');
  }
}
