import { Injectable } from '@angular/core';
import { AuthorizationParameters } from '../models/authorization-parameters';
import { CardSetting } from '../models/card-settings';

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

    getSettings(): Promise<CardSetting[]> {
        return TrelloPowerUp.iframe().get('card', 'shared', 'settings').then(settings => {
            return settings || [];
        });
    }

    addSetting(setting: CardSetting) {
        return this.getSettings()
            .then(settings => {
                if (settings.some(s => s.environmentId === setting.environmentId && s.settingId === setting.settingId)) {
                    return;
                } else {
                    settings.push(setting);
                    return TrelloPowerUp.iframe().set('card', 'shared', 'settings', settings).then(() => {
                        return settings;
                    });
                }
            });
    }

    removeSetting(setting: CardSetting) {
        return this.getSettings()
            .then(settings => {
                const index = settings.findIndex(s => s.environmentId === setting.environmentId && s.settingId === setting.settingId);
                if (index !== -1) {
                    settings.splice(index, 1);
                    return TrelloPowerUp.iframe().set('card', 'shared', 'settings', settings).then(() => {
                        return settings;
                    });
                }
            });
    }
}
