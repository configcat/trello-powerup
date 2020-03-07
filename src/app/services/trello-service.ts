import { Injectable } from '@angular/core';
import { AuthorizationParameters } from '../models/authorization-parameters';

declare var TrelloPowerUp: any;

@Injectable({
    providedIn: 'root'
})
export class TrelloService {
    constructor() { }

    closePopup() {
        return TrelloPowerUp.iframe().closePopup();
    }

    getAuthorizationParameters() {
        return Promise.all([
            TrelloPowerUp.iframe().get('organization', 'shared', 'configCatBasicAuthUserName'),
            TrelloPowerUp.iframe().get('organization', 'shared', 'configCatBasicAuthPassword')
        ]).then(value => {
            return {
                basicAuthUsername: value[0],
                basicAuthPassword: value[1]
            } as AuthorizationParameters;
        });
    }

    setAuthorizationParameters(authorizationParameters: AuthorizationParameters) {
        return TrelloPowerUp.iframe().set('organization', 'shared', {
            configCatBasicAuthUserName: authorizationParameters.basicAuthUsername,
            configCatBasicAuthPassword: authorizationParameters.basicAuthPassword
        });
    }

    getSettings() {
        return TrelloPowerUp.iframe().get('card', 'shared', 'settings').then(settings => {
            return settings || [];
        });
    }

    setSettings(settings: []) {
        return TrelloPowerUp.iframe().set('card', 'shared', 'settings', settings);
    }
}
