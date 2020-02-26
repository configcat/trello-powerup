import { Injectable } from '@angular/core';
import { TrelloService } from './trello.service';
import { IProduct, ISetting, IEnvironment, IConfig, ISettingValue } from '../models/configcat';

declare var TrelloPowerUp: any;

@Injectable({
  providedIn: 'root'
})
export class ConfigcatPublicApiService {

  constructor(private trelloService: TrelloService) { }

  getProducts(): Promise<IProduct[]> {
    return this.fetch('v1/products');
  }

  getConfigs(productId: string): Promise<IConfig[]> {
    return this.fetch('v1/products/' + productId + '/configs');
  }

  getEnvironments(productId: string): Promise<IEnvironment[]> {
    return this.fetch('v1/products/' + productId + '/environments');
  }

  getSettings(configId: string): Promise<ISetting[]> {
    return this.fetch('v1/configs/' + configId + '/settings');
  }

  getSettingValues(environmentId: string, settingId: number): Promise<ISettingValue> {
    return this.fetch('v1/environments/' + environmentId + '/settings/' + settingId + '/value');
  }

  getAuthorizationParameters() {
    return Promise.all([
      TrelloPowerUp.iframe().get('organization', 'shared', 'configCatBasicAuthUserName'),
      TrelloPowerUp.iframe().get('organization', 'shared', 'configCatBasicAuthPassword')
    ]).then(value => {
      if (value[0] && value[1]) {
        return { basicAuthUserName: value[0], basicAuthPassword: value[1] };
      }
      return null;
    });
  }

  private fetch(url): Promise<any> {
    return this.getAuthorizationParameters()
      .then(authorizationParameters => {
        return fetch('https://test-api.configcat.com/' + url,
          {
            headers: {
              Authorization: 'Basic '
                + btoa(authorizationParameters?.basicAuthUserName + ':' + authorizationParameters?.basicAuthPassword)
            }
          })
          .then(result => {
            if (result.ok) {
              return result.json();
            }

            return null;
          });
      });

  }
}
