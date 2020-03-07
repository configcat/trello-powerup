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
        return (trelloPowerUp ?? TrelloPowerUp.iframe()).get('organization', 'shared', 'authorization');
    }

    setAuthorizationParameters(authorizationParameters: AuthorizationParameters, trelloPowerUp = null) {
        return (trelloPowerUp ?? TrelloPowerUp.iframe()).set('organization', 'shared', 'authorization', authorizationParameters);
    }

    removeAuthorizationParameters(trelloPowerUp = null) {
        return (trelloPowerUp ?? TrelloPowerUp.iframe())
            .remove('organization', 'shared', 'authorization');
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

    render(func, trelloPowerUp = null) {
        return (trelloPowerUp ?? TrelloPowerUp.iframe()).render(func);
    }
}
