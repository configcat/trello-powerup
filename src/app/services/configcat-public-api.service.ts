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

  async getProducts(): Promise<IProduct[]> {
    return await this.fetch('v1/products');
  }

  async getConfigs(productId: string): Promise<IConfig[]> {
    return await this.fetch('v1/products/' + productId + '/configs');
  }

  async getEnvironments(productId: string): Promise<IEnvironment[]> {
    return await this.fetch('v1/products/' + productId + '/environments');
  }

  async getSettings(configId: string): Promise<ISetting[]> {
    return await this.fetch('v1/configs/' + configId + '/settings');
  }

  private async fetch(url): Promise<any> {
    const authorizationParameters = await this.trelloService.getAuthorizationParameters(this.TrelloPowerUp.iframe());
    const result = await fetch('https://test-api.configcat.com/' + url,
      {
        headers: {
          Authorization: 'Basic '
            + btoa(authorizationParameters?.basicAuthUserName + ':' + authorizationParameters?.basicAuthPassword)
        }
      });
    if (result.ok) {
      return result.json();
    }
    
    return null;
  }
}
