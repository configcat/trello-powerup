import { Injectable } from '@angular/core';
import { AuthorizationParameters } from '../models/authorization-parameters';
import { PublicApiService } from 'ng-configcat-publicapi-ui';
import { IntegrationLinkType } from 'ng-configcat-publicapi';
import { CardSettingData } from '../models/card-setting-data';

declare let TrelloPowerUp: any;

const CONFIGCAT_ICON = './assets/cat_red.svg';

@Injectable({
    providedIn: 'root'
})
export class TrelloService {

    constructor(private publicApiService: PublicApiService) { }

    iframe() {
        return TrelloPowerUp.iframe();
    }

    closePopup(trelloPowerUp = null) {
        return (trelloPowerUp ?? TrelloPowerUp.iframe()).closePopup();
    }

    sizeTo(selector: any, trelloPowerUp = null) {
        return (trelloPowerUp ?? TrelloPowerUp.iframe()).sizeTo(selector);
    }

    sizeToHeight(height: number, trelloPowerUp = null) {
        return (trelloPowerUp ?? TrelloPowerUp.iframe()).sizeTo(height);
    }

    getAuthorizationParameters(trelloPowerUp = null): Promise<AuthorizationParameters> {
        return (trelloPowerUp ?? TrelloPowerUp.iframe()).loadSecret('authorization').then(authorizationParameters => {
            return JSON.parse(authorizationParameters);
        });
    }

    setAuthorizationParameters(authorizationParameters: AuthorizationParameters, trelloPowerUp = null) {
        return (trelloPowerUp ?? TrelloPowerUp.iframe())
            .storeSecret('authorization', JSON.stringify(authorizationParameters))
            .then(() => {
                return this.setCardSettingData({ lastUpdatedAt: new Date() }, trelloPowerUp);
            })
            .catch(() => { })
            .finally(() => {
                return (trelloPowerUp ?? TrelloPowerUp.iframe())
                .alert({
                    message: 'Authorized to ConfigCat 🎉',
                    duration: 5,
                    display: 'success'
                });
            })

    }

    removeAuthorizationParameters(trelloPowerUp = null) {
        return (trelloPowerUp ?? TrelloPowerUp.iframe())
            .clearSecret('authorization');
    }

    getCardSettingData(trelloPowerUp = null): Promise<CardSettingData> {
        return (trelloPowerUp ?? TrelloPowerUp.iframe()).get('card', 'shared', 'cardSettingData');
    }

    setCardSettingData(cardData: CardSettingData, trelloPowerUp = null): Promise<CardSettingData> {
        return (trelloPowerUp ?? TrelloPowerUp.iframe()).set('card', 'shared', 'cardSettingData', cardData);
    }

    removeCardSettingData(trelloPowerUp = null): Promise<CardSettingData> {
        return (trelloPowerUp ?? TrelloPowerUp.iframe()).remove('card', 'shared', 'cardSettingData');
    }

    updateCardSettingDataLastUpdatedAt(trelloPowerUp = null) {
        return this.getCardSettingData((trelloPowerUp ?? TrelloPowerUp.iframe())).then(setting => {
            if (!setting) {
                setting = { lastUpdatedAt: new Date() };
            }

            setting.lastUpdatedAt = new Date();
            return this.setCardSettingData(setting, (trelloPowerUp ?? TrelloPowerUp.iframe()));
        });
    }

    removeSetting(environmentId, settingId, trelloPowerUp = null) {
        return Promise.all([
            this.getAuthorizationParameters(trelloPowerUp),
            this.getCardData(trelloPowerUp)
        ]).then(value => {
            const authorizationParameters = value[0];
            const card = value[1];

            return this.publicApiService
                .createIntegrationLinksService(authorizationParameters.basicAuthUsername, authorizationParameters.basicAuthPassword)
                .deleteIntegrationLink(environmentId, settingId, IntegrationLinkType.Trello, card.id)
                .toPromise();
        })
            .then((deleteModel) => {
                if (!deleteModel.hasRemainingIntegrationLink) {
                    return this.removeCardSettingData(trelloPowerUp);
                } else {
                    return this.updateCardSettingDataLastUpdatedAt(trelloPowerUp);
                }
            });
    }

    render(func, trelloPowerUp = null) {
        return (trelloPowerUp ?? TrelloPowerUp.iframe()).render(func);
    }

    getCardData(trelloPowerUp = null) {
        return (trelloPowerUp ?? TrelloPowerUp.iframe()).card('id', 'name', 'url');
    }

    getBadgeData(trelloPowerUp) {
        return Promise.all([
            this.getAuthorizationParameters(trelloPowerUp),
            this.getCardSettingData(trelloPowerUp),
            this.getCardData(trelloPowerUp)
        ]).then(value => {
            const authorizationParameters = value[0];
            const setting = value[1];
            const card = value[2];

            if (!setting || !card || !authorizationParameters) {
                return;
            }

            return this.publicApiService
                .createIntegrationLinksService(authorizationParameters.basicAuthUsername, authorizationParameters.basicAuthPassword)
                .getIntegrationLinkDetails(IntegrationLinkType.Trello, card.id)
                .toPromise()
                .then(linkDetails => {
                    return linkDetails.details.map(detail => {
                        return {
                            text: linkDetails.details.length > 1 ? detail.setting.name + ': ' + detail.status : detail.status,
                            icon: CONFIGCAT_ICON,
                            color: 'green'
                        };
                    });
                });
        });
    }

    showHttpUnauthorizedAlert(trelloPowerUp = null) {
        return (trelloPowerUp ?? TrelloPowerUp.iframe())
            .alert({
                message: 'Authorization failed. Please try to log in again.',
                duration: 5,
                display: 'error'
            });
    }

}
