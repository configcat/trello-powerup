import { Injectable } from '@angular/core';
import { TrelloService } from './trello.service';
import { IProduct, ISetting, IEnvironment, IConfig } from '../models/configcat';

declare var window: any;

@Injectable({
  providedIn: 'root'
})
export class ConfigcatPublicApiService {
  TrelloPowerUp = window.TrelloPowerUp;

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

  private fetch(url): Promise<any> {
    return this.trelloService.getAuthorizationParameters(this.TrelloPowerUp.iframe())
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
