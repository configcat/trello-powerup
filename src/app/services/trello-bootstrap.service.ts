import { Injectable, inject } from '@angular/core';
import { TrelloService } from './trello-service';

const CONFIGCAT_ICON = './assets/cat_red.svg';

declare let TrelloPowerUp: any;

@Injectable({
  providedIn: 'root'
})
export class TrelloBootstrapService {
  private trelloService = inject(TrelloService);


  initialize() {
    TrelloPowerUp.initialize({
      'card-back-section': this.getCardBackSection,
      'card-buttons': this.getCardButtons,
      'authorization-status': this.getAuthorizationStatus,
      'show-authorization': this.showAuthorization,
      'on-disable': this.disable,
      'card-badges': this.getBadges
    });
  }

  private getBadges = (t) => {
    return this.trelloService.getBadgeData(t);
  }

  private disable = (t) => {
    return this.trelloService.removeAuthorizationParameters(t);
  }

  private showAuthorization = (t) => {
    return t.popup({
      title: 'Authorize ConfigCat',
      url: './authorize',
      height: 300,
    });
  }

  private getAuthorizationStatus = (t) => {
    return this.trelloService.getAuthorizationParameters(t)
      .then(authorizationParameters => {
        if (authorizationParameters?.basicAuthUsername && authorizationParameters?.basicAuthPassword) {
          return { authorized: true };
        }
        return { authorized: false };
      })
      .catch(() => ({ authorized: false }));
  }

  private getCardButtons = () => {
    return [{
      // usually you will provide a callback function to be run on button click
      // we recommend that you use a popup on click generally
      icon: CONFIGCAT_ICON,
      text: 'Link Feature Flag',
      callback: t => {
        return t.popup({
          title: 'Link Feature Flag',
          url: './addfeatureflag',
          height: 380
        });
      }
    },
    {
      // usually you will provide a callback function to be run on button click
      // we recommend that you use a popup on click generally
      icon: CONFIGCAT_ICON,
      text: 'Create and Link Feature Flag',
      callback: t => {
        return t.popup({
          title: 'Create and Link Feature Flag',
          url: './createfeatureflag',
          height: 380,
        });
      }
    }];
  }

  private getCardBackSection = (t) => {
    return this.trelloService.getCardSettingData(t)
      .then(setting => {
        if (setting) {
          return {
            title: 'ConfigCat',
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
