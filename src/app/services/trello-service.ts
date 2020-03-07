import { Injectable } from '@angular/core';
import { AuthorizationParameters } from '../models/authorization-parameters';
import { CardSetting } from '../models/card-settings';
import { PublicApiService } from 'ng-configcat-publicapi-ui';

declare var TrelloPowerUp: any;

const CONFIGCAT_ICON = './assets/logo.png';

@Injectable({
    providedIn: 'root'
})
export class TrelloService {

    constructor(private publicApiService: PublicApiService) { }

    closePopup(trelloPowerUp = null) {
        return (trelloPowerUp ?? TrelloPowerUp.iframe()).closePopup();
    }

    sizeTo(selector: string, trelloPowerUp = null) {
        return (trelloPowerUp ?? TrelloPowerUp.iframe()).sizeTo(selector);
    }

    getAuthorizationParameters(trelloPowerUp = null): Promise<AuthorizationParameters> {
        return (trelloPowerUp ?? TrelloPowerUp.iframe()).get('organization', 'shared', 'authorization');
    }

    setAuthorizationParameters(authorizationParameters: AuthorizationParameters, trelloPowerUp = null) {
        return (trelloPowerUp ?? TrelloPowerUp.iframe())
            .set('organization', 'shared', 'authorization', authorizationParameters)
            .then(() => {
                return (trelloPowerUp ?? TrelloPowerUp.iframe())
                    .alert({
                        message: 'Authorized to ConfigCat 🎉',
                        duration: 5 ,
                        display: 'success'
                    });
            });
    }

    removeAuthorizationParameters(trelloPowerUp = null) {
        return (trelloPowerUp ?? TrelloPowerUp.iframe())
            .remove('organization', 'shared', 'authorization');
    }

    getSetting(trelloPowerUp = null): Promise<CardSetting> {
        return (trelloPowerUp ?? TrelloPowerUp.iframe()).get('card', 'shared', 'setting');
    }

    setSetting(setting: CardSetting, trelloPowerUp = null) {
        return (trelloPowerUp ?? TrelloPowerUp.iframe()).set('card', 'shared', 'setting', setting);
    }

    updateSetting(trelloPowerUp = null) {
        return this.getSetting((trelloPowerUp ?? TrelloPowerUp.iframe())).then(setting => {
            setting.lastUpdatedAt = new Date();
            return this.setSetting(setting, (trelloPowerUp ?? TrelloPowerUp.iframe()));
        });
    }

    removeSetting(trelloPowerUp = null) {
        return (trelloPowerUp ?? TrelloPowerUp.iframe()).remove('card', 'shared', 'setting');
    }

    render(func, trelloPowerUp = null) {
        return (trelloPowerUp ?? TrelloPowerUp.iframe()).render(func);
    }

    getBadgeData(trelloPowerUp) {
        return Promise.all([
            this.getAuthorizationParameters(trelloPowerUp),
            this.getSetting(trelloPowerUp)
        ]).then(value => {
            const authorizationParameters = value[0];
            const setting = value[1];

            if (!setting || !authorizationParameters) {
                return;
            }

            return this.publicApiService
                .createSettingValuesService(authorizationParameters.basicAuthUsername, authorizationParameters.basicAuthPassword)
                .getSettingValue(setting.environmentId, '' + setting.settingId)
                .toPromise()
                .then(settingValue => {
                    let text = '';
                    if ((!settingValue.rolloutRules || settingValue.rolloutRules.length === 0)
                        && (!settingValue.rolloutPercentageItems || settingValue.rolloutPercentageItems.length === 0)) {

                        if (settingValue.setting.settingType === 'boolean') {
                            text = settingValue.value ? 'Released' : 'Not released';
                        } else {
                            text = '' + settingValue.value;
                        }
                    } else {
                        if (settingValue.rolloutRules && settingValue.rolloutRules.length > 0) {
                            text = settingValue.rolloutRules.length + ' rules';
                        }

                        if (settingValue.rolloutPercentageItems && settingValue.rolloutPercentageItems.length > 0) {
                            if (text !== '') {
                                text += ' + ';
                            }

                            if (settingValue.setting.settingType === 'boolean') {
                                text += settingValue.rolloutPercentageItems[0].percentage + '%';
                            } else {
                                text += '%';
                            }
                        }
                    }

                    return {
                        text,
                        icon: CONFIGCAT_ICON,
                        color: 'green'
                    };
                });
        });
    }
}
