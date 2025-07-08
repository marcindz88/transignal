# @ngbros/transignal 🚀

[](https://github.com/your-repo)
[](https://www.google.com/search?q=https://www.npmjs.com/package/%40ngbros/transignal)
[](https://www.google.com/search?q=https://bundlephobia.com/result%3Fp%3D%40ngbros/transignal)
[](https://opensource.org/licenses/MIT)

A modern, type-safe, and lightweight internationalization (i18n) library for Angular, built using just Angular Signals. Say goodbye to boilerplate and hello to intuitive, performant, and scalable translations.
No more useless `<ng-container>` or structural directives affecting static DOM creation. Tired of runtime production errors, missing keys, differences between translation files? We are too.

`@ngbros/transignal` is designed to provide a seamless developer experience with powerful features out of the box, making your translation workflow easier and more robust than ever.

-----

## ✨ Why Choose @ngbros/transignal?

`@ngbros/transignal` isn't just another i18n library. It's a next-generation solution that leverages the full power of modern Angular. Here’s why it stands out, especially when compared to libraries like Transloco or ngx-translate:

* **🤖 Superior Type/Key Safety & Inference:** Forget manual type definitions for your translation keys. `@ngbros/transignal` offers automatic and powerful type inference for all your translation keys and structures. This means fewer runtime errors and a more confident coding experience.

* **💡 Intelligent Autocompletion:** Enjoy flawless key autocompletion directly in your IDE. `@ngbros/transignal` understands your translation schema, providing suggestions as you type and catching errors before they happen.

* **🧩 Simple & Centralized Configuration:** A single, straightforward configuration file is all you need to get started. No complex setup or multiple provider definitions required.

* **🌍 Built-in Plural & Select Support:** Handle complex pluralization and selection rules effortlessly without needing extra plugins or message format parsers. The syntax is clean, intuitive, and type-safe.

* **🧪 Effortless Testing:** We provide a streamlined `provideTransignalTesting` function that makes setting up unit tests a breeze. You can mock translations with ease and run your tests without any asynchronous loading hassles.

* **🌳 Tree-Shakeable Features:** Keep your application lean. Optional features like `withPreloadScopes`, `withLanguageLocalStorageSync`, and `withNavigatorLanguage` are tree-shakeable, ensuring they don't add to your bundle size if you don't use them.

* **📦 No Peer Dependencies (Except Angular):** `@ngbros/transignal` has no external dependencies other than Angular itself. This means fewer `node_modules` conflicts and a lighter footprint.

* **🪶 Smaller Bundle Size:** Our library is designed to be incredibly lightweight, resulting in a smaller impact on your application's final bundle size compared to other solutions.

* **🚀 100% Signal-Based & RxJS-Free:** Built from the ground up with Angular Signals and the new `resource` utility, `@ngbros/transignal` is reactive, performant, and aligned with the future of Angular.

* **⚡ Vite-Powered Caching:** By using TypeScript files (`.ts`) instead of JSON for translations, your files are processed by Vite (or the Angular CLI), which automatically adds a unique hash to the filename. This ensures perfect cache-busting and efficient loading.

-----

## 📊 Comparison with Other i18n Libraries

| Feature                    | @ngbros/transignal                 | Transloco                                | ngx-translate                      | Angular i18n                        |
|----------------------------|------------------------------------|------------------------------------------|------------------------------------|-------------------------------------|
| **Type and key Inference** | ✅ **Excellent & Automatic**        | ⚠️ Partial (requires plugins/generation) | ❌ Manual                           | Not needed                          |
| **Bundle Size**            | 🥇 **Very Small**                  | 🥈 Small                                 | 🥉 Medium                          | 🏅 Large (copies app for each lang) |
| **Peer Dependencies**      | ❌ **None** (besides Angular)       | ⚠️ Required if message-format used       | ⚠️ Required if message-format used | ❌ None                              |
| **Plural/Select Support**  | ✅ **Built-in & Type-Safe**         | ✅ (via message-format plugin)            | ✅ (via message-format plugin)      | ✅ Built-in                          |
| **Caching Support**        | ✅ **Automatic (Vite/CLI hashing)** | ✅ (via loader config)                    | ✅ (via loader config)              | N/A (build-time)                    |
| **Core Architecture**      | **Signals**                        | **RxJS**                                 | **RxJS**                           | **Build-Time**                      |
| **Testing Setup**          | ✅ **Simple & Integrated**          | ✅ Good                                   | ✅ Good                             | cumbersome                          |

-----

## 🛠️ Installation and Setup

Getting started with `@ngbros/transignal` is simple.

1.  **Install the package:**

    ```bash
    pnpm install @ngbros/transignal
    ```

    ```bash
    npm install @ngbros/transignal
    ```

2.  **Define your translations:**

    Create your translation files using TypeScript. This enables strong typing and optimal processing.

    `i18n/home/en.ts` - base language

    ```typescript
    import { plural, select } from '@ngbros/transignal';

    export default {
      heading: 'Home heading - {test}',
      array: ['home 1', 'home 2', 'home 3'],
      homeNested: {
        blocks: {
          something: 'Example something',
          array: ['nested home 1', 'nested home 2', 'nested home 3'],
        },
      },
      plural: {
        users: plural({
          1: '1 user',
          few: 'only {count} users',
          many: '{count} users',
        }),
      },
      select: {
        categories: select({
          all: 'All categories',
          test: 'Test category',
          null: 'None',
        }),
      },
    };
    ```

    `i18n/home/fr.ts` - another language

    ```typescript
    import { plural, select } from '@ngbros/transignal';
    import type en from './en';

    export default {
      heading: 'FR Home heading',
      // ... other translations
    } satisfies typeof en; // Ensures the structure matches the English file!
    ```

    `i18n/translations.ts` - index file

    ```typescript
    import global from './global/en';
    import home from './home/en';
    
    export default { global, home };
    ```

3.  **Create the main configuration:**

    Set up your `transignal` instance. This is where you define your languages, loader, and any optional features.

    `transignal.ts`

    ```typescript
    import { prepareTransignal, treeShakedTranslations, withNavigatorLanguage, withLanguageLocalStorageSync, withPreloadScopes } from '@ngbros/transignal';
    import type translations from './i18n/translations'; // remember to use type to make it easier for bundler to tree-shake it

    export const transignal = prepareTransignal(
      {
        defaultLang: 'en',
        availableLangs: ['en', 'fr'],
        translations: treeShakedTranslations<typeof translations>(),
        loader: (scope, lang) => import(`./i18n/${scope}/${lang}.ts`).then(res => res.default), // use native vite based loading
      },
      // optional features
      withServerSideLanguage(),
      withNavigatorLanguage(),
      withLanguageLocalStorageSync(),
      withPreloadScopes(['home']),
      withTranslatedTitle('home') // <- more info about these in jsdoc
    );
    ```

4.  **Provide the configuration to your app:**

    In your `app.config.ts`, use the `provide` function from your `transignal` instance.

    `app.config.ts`

    ```typescript
    import { ApplicationConfig } from '@angular/core';
    import { transignal } from './transignal';

    export const appConfig: ApplicationConfig = {
      providers: [transignal.provide()],
    };
    ```

-----

## 🚀 Usage Examples

### Basic Usage

Inject the service and use the `t` function to get your translations.

```typescript
import { Component } from '@angular/core';
import { transignal } from './transignal';

@Component({
  selector: 'app-root',
  template: `
    <h1>{{ t('heading', { test: 'param' }) }}</h1>
    <p>Loading: {{ isLoading() ? 'yes' : 'no' }}</p>
    <button (click)="switchLanguage()">Switch language</button>
  `,
})
export class AppComponent {
  private transignalService = transignal.service();
  protected t = transignal.t('home'); // Scope your translations to 'home'
  protected isLoading = this.transignalService.isLoading;

  switchLanguage() {
    const currentLang = this.transignalService.activeLang();
    this.transignalService.activeLang.set(currentLang === 'en' ? 'fr' : 'en');
  }
}
```

### Plurals Example 🌍

Handle pluralization with the built-in `plural` helper and `t.plural` method.

````html
<h2>Plurals example</h2>
<p>{{ t.plural('plural.users', 1) }}</p>    <p>{{ t.plural('plural.users', 5) }}</p>    ```

The `plural` function automatically receives a `{count}` parameter.

### Select Example ☑️

Handle conditional translations with the `select` helper and `t.select` method.

```html
<h2>Select example</h2>
<p>{{ t.select('select.categories', 'all') }}</p>   <p>{{ t.select('select.categories', 'test') }}</p> <p>{{ t.select('select.categories', null) }}</p>    ```

### Prefixes for Nested Keys 🏷️

Simplify access to nested translation objects with the `prefix` method. This is great for keeping your templates clean.

```typescript
// app.component.ts
@Component({
  template: `
    <h2>Prefix example</h2>
    @let tPrefixed = t.prefix('homeNested.blocks');
    <p>{{ tPrefixed('something') }}</p> 
    @for (entry of tPrefixed.arr('array'); track entry) {
      <p>{{ entry }}</p>
    }
  `,
})
export class AppComponent {
  protected t = transignal.t('home');
}
````

### Testing Your Component 🧪

Testing is incredibly simple with `provideTransignalTesting`. It instantly loads all your translations, making your tests synchronous and easy to write.

```typescript
// your.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideTransignalTesting } from '@ngbros/transignal';
import { transignal } from './transignal';
import { YourComponent } from './your.component';

// Import your raw translation files
import global from './i18n/global/en';
import home from './i18n/home/en';

describe('YourComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YourComponent],
      providers: [
        provideTransignalTesting(transignal, {
          global,
          home,
        }),
      ],
    }).compileComponents();
  });

  it('should display the correct heading', () => {
    const fixture = TestBed.createComponent(YourComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Home heading');
  });
});
```

-----

## ▶ Demo app and setup

We have prepared a demo app to showcase all the library features. Check it out [here!](https://stackblitz.com/~/github.com/marcindz88/transignal)

-----

## 🔄 Migration Guides

Ready to migrate from an older i18n library? We've got you covered. Check out our dedicated migration guides (coming soon\!):

### Migrating from Transloco

TODO


### Migrating from ngx-translate
TODO

-----

Enjoy the future of internationalization in Angular\! 🎉
