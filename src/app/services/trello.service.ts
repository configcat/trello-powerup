import { Injectable } from '@angular/core';
import { AuthorizationParameters } from '../models/authorization-parameters';
import { CardSetting, CardSettings } from '../models/card-settings';

const CONFIGCAT_ICON = './images/logo.png';

declare var window: any;

@Injectable({
  providedIn: 'root'
})
export class TrelloService {
  TrelloPowerUp = window.TrelloPowerUp;
  constructor() { }

  initialize() {
    this.TrelloPowerUp.initialize({
      'card-back-section': (t, options) => {
        return t.get('card', 'shared', 'settings')
          .then(settings => {
            if (settings && settings.length > 0) {
              return {
                title: 'ConfigCat Feature flags or Settings',
                icon: CONFIGCAT_ICON, // Must be a gray icon, colored icons not allowed.
                content: {
                  type: 'iframe',
                  url: 'featureflags',
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
              url: 'addfeatureflag',
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
        return this.getAuthorizationParameters(t).then(authorizationParameters => {
          return {
            authorized: authorizationParameters
              && authorizationParameters.basicAuthUserName && authorizationParameters.basicAuthPassword
          };
        });
      },
      'show-authorization': (t, options) => {
        return t.popup({
          title: 'Authorize ConfigCat',
          url: 'authorize',
          height: 300,
        });
      },
      'on-disable': (t, options) => { this.clearAuthorizationParameters(t); }
    });
  }

  async getAuthorizationParameters(trelloIFrame: any): Promise<AuthorizationParameters> {
    try {
      const basicAuthUserName = await trelloIFrame.get('organization', 'shared', 'basicAuthUserName');
      const basicAuthPassword = await trelloIFrame.get('organization', 'shared', 'basicAuthPassword');

      if (basicAuthUserName && basicAuthPassword) {
        return { basicAuthUserName, basicAuthPassword };
      }
    } catch {
    }

    return null;
  }

  async setAuthorizationParameters(trelloIFrame: any, authorizationParameters: AuthorizationParameters) {
    try {
      await trelloIFrame.set('organization', 'shared', 'basicAuthUserName', authorizationParameters.basicAuthUserName);
      await trelloIFrame.set('organization', 'shared', 'basicAuthPassword', authorizationParameters.basicAuthPassword);
    } catch {
    }
  }

  async clearAuthorizationParameters(trelloIFrame: any) {
    try {
      await trelloIFrame.remove('organization', 'shared', 'basicAuthUserName');
      await trelloIFrame.remove('organization', 'shared', 'basicAuthPassword');
    } catch {
      // TODO
    }
  }

  async getCardSettings(trelloIFrame: any): Promise<CardSettings> {
    try {
      const settings = await trelloIFrame.get('card', 'shared', 'settings');
      return settings;
    } catch {
      // TODO
    }

    return null;
  }

  async setCardSettings(trelloIFrame: any, cardSettings: CardSettings) {
    try {
      await trelloIFrame.set('card', 'shared', 'settings', cardSettings);
    } catch {
      // TODO
    }
  }
}
