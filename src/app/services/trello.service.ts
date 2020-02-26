import { Injectable } from '@angular/core';
import { AuthorizationParameters } from '../models/authorization-parameters';
import { CardSetting, CardSettings } from '../models/card-settings';

const CONFIGCAT_ICON = './assets/logo.png';

declare var TrelloPowerUp: any;

@Injectable({
  providedIn: 'root'
})
export class TrelloService {
  constructor() { }

  initialize() {
    TrelloPowerUp.initialize({
      'card-back-section': (t, options) => {
        return t.get('card', 'shared', 'settings')
          .then(settings => {
            if (settings && settings.length > 0) {
              return {
                title: 'ConfigCat Feature flags or Settings',
                icon: CONFIGCAT_ICON, // Must be a gray icon, colored icons not allowed.
                content: {
                  type: 'iframe',
                  url: './featureflags',
                  height: 230 // Max height is 500
                }
              };
            } else {
              return [];
            }
          });
      },
      'card-buttons': (x, options) => {
        return [{
          // usually you will provide a callback function to be run on button click
          // we recommend that you use a popup on click generally
          icon: CONFIGCAT_ICON, // don't use a colored icon here
          text: 'Feature flag or Setting',
          callback: t => {
            return t.popup({
              title: 'Select Feature Flag or Setting',
              url: './addfeatureflag',
              height: 380 // we can always resize later, but if we know the size in advance, its good to tell Trello
            });
          }
        }];
      },
      'format-url': (t, options) => {
        return {
          icon: CONFIGCAT_ICON, // don't use a colored icon here
          text: '👉 ' + options.url + ' 👈'
        };
      },
      'authorization-status': (t, options) => {
        return t.get('organization', 'shared', 'configCatBasicAuthUserName')
          .then(basicAuthUserName => {
            return t.get('organization', 'shared', 'configCatBasicAuthPassword').then(basicAuthPassword => {
              if (basicAuthUserName && basicAuthPassword) {
                return { authorized: true };
              }
              return { authorized: false };
            });
          })
          .catch(() => ({ authorized: false }));
      },
      'show-authorization': (t, options) => {
        return t.popup({
          title: 'Authorize ConfigCat',
          url: './authorize',
          height: 300,
        });
      },
      'on-disable': (t) => t.remove('organization', 'shared', 'configCatBasicAuthUserName')
        .then(t.remove('organization', 'shared', 'configCatBasicAuthPassword'))
    });
  }
}
