import { Injectable } from '@angular/core';
import { TrelloService } from './trello-service';

const CONFIGCAT_ICON = './assets/logo.png';

declare var TrelloPowerUp: any;

@Injectable({
  providedIn: 'root'
})
export class TrelloBootstrapService {
  constructor(private trelloService: TrelloService) { }

  initialize() {
    TrelloPowerUp.initialize({
      'card-back-section': this.getCardBackSection,
      'card-buttons': this.getCardButtons,
      'authorization-status': this.getAuthorizationStatus,
      'show-authorization': this.showAuthorization,
      'on-disable': this.disable
    });
  }

  private disable = (t) => {
    return this.trelloService.removeAuthorizationParameters(t);
  }

  private showAuthorization = (t, options) => {
    return t.popup({
      title: 'Authorize ConfigCat',
      url: './authorize',
      height: 300,
    });
  }

  private getAuthorizationStatus = (t, options) => {
    return this.trelloService.getAuthorizationParameters(t)
      .then(authorizationParameters => {
        if (authorizationParameters && authorizationParameters.basicAuthUsername && authorizationParameters.basicAuthPassword) {
          return { authorized: true };
        }
        return { authorized: false };
      })
      .catch(() => ({ authorized: false }));
  }

  private getCardButtons = (x, options) => {
    return [{
      // usually you will provide a callback function to be run on button click
      // we recommend that you use a popup on click generally
      icon: CONFIGCAT_ICON,
      text: 'Feature flag or Setting',
      callback: t => {
        return t.popup({
          title: 'Select Feature Flag or Setting',
          url: './addfeatureflag',
          height: 380
        });
      }
    }];
  }

  private getCardBackSection = (t, options) => {
    return this.trelloService.getSettings(t)
      .then(settings => {
        if (settings && settings.length > 0) {
          return {
            title: 'ConfigCat Feature flags or Settings',
            icon: CONFIGCAT_ICON, // Must be a gray icon, colored icons not allowed.
            content: {
              type: 'iframe',
              url: t.signUrl('./featureflags')
            }
          };
        } else {
          return [];
        }
      });
  }
}
