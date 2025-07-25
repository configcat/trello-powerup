import { inject, Injectable } from "@angular/core";
import { IntegrationLinkDetailsModel, IntegrationLinkType } from "ng-configcat-publicapi";
import { PublicApiService } from "ng-configcat-publicapi-ui";
import { firstValueFrom } from "rxjs";
import { CallbackHandler, CardBadge, IFrame } from "trellopowerup/lib/powerup";
import { AuthorizationParameters } from "../models/authorization-parameters";
import { CardSettingData } from "../models/card-setting-data";

declare let trelloPowerUpCallbackHandler: Trello.PowerUp.CallbackHandler;
declare let trelloPowerUp: Trello.PowerUp.PowerUp;

const CONFIGCAT_ICON = "./assets/cat_red.svg";

@Injectable({
  providedIn: "root",
})
export class TrelloService {
  private readonly publicApiService = inject(PublicApiService);

  iframe(): IFrame {
    return trelloPowerUp.iframe();
  }

  callbackHandler(): CallbackHandler {
    return trelloPowerUpCallbackHandler;
  }

  closePopup(trelloPowerUp: CallbackHandler | null = null) {
    return (trelloPowerUp ?? trelloPowerUpCallbackHandler).closePopup();
  }

  sizeTo(selector: string, trelloPowerUp: CallbackHandler | null = null) {
    return (trelloPowerUp ?? trelloPowerUpCallbackHandler).sizeTo(selector);
  }

  sizeToHeight(height: number, trelloPowerUp: CallbackHandler | null = null) {
    return (trelloPowerUp ?? trelloPowerUpCallbackHandler).sizeTo(height);
  }

  getAuthorizationParameters(trelloPowerUp: CallbackHandler | null = null): Promise<AuthorizationParameters> {
    return (trelloPowerUp ?? trelloPowerUpCallbackHandler).loadSecret("authorization").then((authorizationParameters: string) => {
      return JSON.parse(authorizationParameters) as AuthorizationParameters;
    });
  }

  setAuthorizationParameters(authorizationParameters: AuthorizationParameters, trelloPowerUp: CallbackHandler | null = null): Promise<void> {
    return (trelloPowerUp ?? trelloPowerUpCallbackHandler)
      .storeSecret("authorization", JSON.stringify(authorizationParameters))
      .then(() => {
        return this.setCardSettingData({ lastUpdatedAt: new Date() }, trelloPowerUp);
      })
      .finally(() => {
        return void (trelloPowerUp ?? trelloPowerUpCallbackHandler)
          .alert({
            message: "Authorized to ConfigCat 🎉",
            duration: 5,
            display: "success",
          });
      });

  }

  removeAuthorizationParameters(trelloPowerUp: CallbackHandler | null = null) {
    return (trelloPowerUp ?? trelloPowerUpCallbackHandler)
      .clearSecret("authorization");
  }

  getCardSettingData(trelloPowerUp: CallbackHandler | null = null): Promise<CardSettingData> {
    return (trelloPowerUp ?? trelloPowerUpCallbackHandler).get("card", "shared", "cardSettingData");
  }

  setCardSettingData(cardData: CardSettingData, trelloPowerUp: CallbackHandler | null = null): Promise<void> {
    return (trelloPowerUp ?? trelloPowerUpCallbackHandler).set("card", "shared", "cardSettingData", cardData);
  }

  removeCardSettingData(trelloPowerUp: CallbackHandler | null = null): Promise<void> {
    return (trelloPowerUp ?? trelloPowerUpCallbackHandler).remove("card", "shared", "cardSettingData");
  }

  updateCardSettingDataLastUpdatedAt(trelloPowerUp: CallbackHandler | null = null) {
    return this.getCardSettingData((trelloPowerUp ?? trelloPowerUpCallbackHandler)).then(setting => {
      if (!setting) {
        setting = { lastUpdatedAt: new Date() };
      }

      setting.lastUpdatedAt = new Date();
      return this.setCardSettingData(setting, (trelloPowerUp ?? trelloPowerUpCallbackHandler));
    });
  }

  removeSetting(environmentId: string, settingId: number, trelloPowerUp: CallbackHandler | null = null) {
    return Promise.all([
      this.getAuthorizationParameters(trelloPowerUp),
      this.getCardData(trelloPowerUp),
    ]).then(value => {
      const authorizationParameters = value[0];
      const card = value[1];

      return this.publicApiService
        .createIntegrationLinksService(authorizationParameters.basicAuthUsername, authorizationParameters.basicAuthPassword)
        .deleteIntegrationLink(environmentId, settingId, IntegrationLinkType.Trello, card.id)
        .subscribe({
          next: deleteModel => {
            if (!deleteModel.hasRemainingIntegrationLink) {
              void this.removeCardSettingData(trelloPowerUp);
            } else {
              void this.updateCardSettingDataLastUpdatedAt(trelloPowerUp);
            }
          },
        }
        );
    });
  }

  render(func: () => void, trelloPowerUpIFrame: IFrame | null = null) {
    return (trelloPowerUpIFrame ?? trelloPowerUp.iframe()).render(func);
  }

  getCardData(trelloPowerUp: CallbackHandler | null = null) {
    return (trelloPowerUp ?? trelloPowerUpCallbackHandler).card("id", "name", "url");
  }

  getBadgeData(trelloPowerUp: CallbackHandler | null = null): Promise<CardBadge[]> {
    return Promise.all([
      this.getAuthorizationParameters(trelloPowerUp),
      this.getCardSettingData(trelloPowerUp),
      this.getCardData(trelloPowerUp),
    ]).then(async value => {
      const authorizationParameters = value[0];
      const setting = value[1];
      const card = value[2];

      if (!setting || !card || !authorizationParameters) {
        return [] as CardBadge[];
      }

      const linkDetails: IntegrationLinkDetailsModel = await firstValueFrom(this.publicApiService
        .createIntegrationLinksService(authorizationParameters.basicAuthUsername, authorizationParameters.basicAuthPassword)
        .getIntegrationLinkDetails(IntegrationLinkType.Trello, card.id));

      if (linkDetails?.details && linkDetails.details.length > 0) {
        return linkDetails.details.map(detail => {
          return {
            text: linkDetails.details!.length > 1 ? detail.setting.name + ": " + detail.status : detail.status,
            icon: CONFIGCAT_ICON,
            color: "green",
          } as CardBadge;
        });
      }
      return [] as CardBadge[];
    });
  }

  showHttpUnauthorizedAlert(trelloPowerUp: CallbackHandler | null = null) {
    return (trelloPowerUp ?? trelloPowerUpCallbackHandler)
      .alert({
        message: "Authorization failed. Please try to log in again.",
        duration: 5,
        display: "error",
      });
  }

}
