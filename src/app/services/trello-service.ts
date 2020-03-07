import { Injectable } from '@angular/core';
import { AuthorizationParameters } from '../models/authorization-parameters';
import { CardSetting } from '../models/card-settings';

declare var TrelloPowerUp: any;

@Injectable({
    providedIn: 'root'
})
export class TrelloService {
    constructor() { }

    closePopup(trelloPowerUp = null) {
        return (trelloPowerUp ?? TrelloPowerUp.iframe()).closePopup();
    }

    getAuthorizationParameters(trelloPowerUp = null) {
        return Promise.all([
            (trelloPowerUp ?? TrelloPowerUp.iframe()).get('organization', 'shared', 'configCatBasicAuthUsername'),
            (trelloPowerUp ?? TrelloPowerUp.iframe()).get('organization', 'shared', 'configCatBasicAuthPassword')
        ]).then(value => {
            if (!value[0] || !value[1]) {
                return null;
            }
            return {
                basicAuthUsername: value[0],
                basicAuthPassword: value[1]
            } as AuthorizationParameters;
        });
    }

    setAuthorizationParameters(authorizationParameters: AuthorizationParameters, trelloPowerUp = null) {
        return (trelloPowerUp ?? TrelloPowerUp.iframe()).set('organization', 'shared', {
            configCatBasicAuthUsername: authorizationParameters.basicAuthUsername,
            configCatBasicAuthPassword: authorizationParameters.basicAuthPassword
        });
    }

    removeAuthorizationParameters(trelloPowerUp = null) {
        return (trelloPowerUp ?? TrelloPowerUp.iframe())
            .remove('organization', 'shared', 'configCatBasicAuthUsername')
            .then(() => {
                return (trelloPowerUp ?? TrelloPowerUp.iframe()).remove('organization', 'shared', 'configCatBasicAuthPassword');
            });
    }

    getSettings(trelloPowerUp = null): Promise<CardSetting[]> {
        return (trelloPowerUp ?? TrelloPowerUp.iframe()).get('card', 'shared', 'settings').then(settings => {
            return settings || [];
        });
    }

    addSetting(setting: CardSetting, trelloPowerUp = null) {
        return this.getSettings(trelloPowerUp)
            .then(settings => {
                if (settings.some(s => s.environmentId === setting.environmentId && s.settingId === setting.settingId)) {
                    return;
                } else {
                    settings.push(setting);
                    return (trelloPowerUp ?? TrelloPowerUp.iframe()).set('card', 'shared', 'settings', settings).then(() => {
                        return settings;
                    });
                }
            });
    }

    removeSetting(setting: CardSetting, trelloPowerUp = null) {
        return this.getSettings(trelloPowerUp)
            .then(settings => {
                const index = settings.findIndex(s => s.environmentId === setting.environmentId && s.settingId === setting.settingId);
                if (index !== -1) {
                    settings.splice(index, 1);
                    return (trelloPowerUp ?? TrelloPowerUp.iframe()).set('card', 'shared', 'settings', settings).then(() => {
                        return settings;
                    });
                }
            });
    }
}
