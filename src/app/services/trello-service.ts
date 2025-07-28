import { inject, Injectable } from "@angular/core";
import { IntegrationLinkDetailsModel, IntegrationLinkType } from "ng-configcat-publicapi";
import { PublicApiService } from "ng-configcat-publicapi-ui";
import { firstValueFrom } from "rxjs";
import { CallbackHandler, CardBadge, IFrame } from "trellopowerup/lib/powerup";
import { AuthorizationParameters } from "../models/authorization-parameters";
import { CardSettingData } from "../models/card-setting-data";

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

  closePopup(trelloPowerUpIFrame: IFrame | null = null) {
    return (trelloPowerUpIFrame ?? trelloPowerUp.iframe()).closePopup();
  }

  sizeTo(selector: string, trelloPowerUpIFrame: IFrame | null = null) {
    return (trelloPowerUpIFrame ?? trelloPowerUp.iframe()).sizeTo(selector);
  }

  sizeToHeight(height: number, trelloPowerUpIFrame: IFrame | null = null) {
    return (trelloPowerUpIFrame ?? trelloPowerUp.iframe()).sizeTo(height);
  }

  getAuthorizationParameters(trelloPowerUpCallbackHandler: CallbackHandler | null = null): Promise<AuthorizationParameters> {
    return (trelloPowerUpCallbackHandler ?? trelloPowerUp.iframe()).loadSecret("authorization").then((authorizationParameters: string) => {
      return JSON.parse(authorizationParameters) as AuthorizationParameters;
    });
  }

  setAuthorizationParameters(authorizationParameters: AuthorizationParameters, trelloPowerUpCallbackHandler: CallbackHandler | null = null): Promise<void> {
    return (trelloPowerUpCallbackHandler ?? trelloPowerUp.iframe())
      .storeSecret("authorization", JSON.stringify(authorizationParameters))
      .then(() => {
        return this.setCardSettingData({ lastUpdatedAt: new Date() }, trelloPowerUpCallbackHandler);
      })
      .finally(() => {
        return void (trelloPowerUpCallbackHandler ?? trelloPowerUp.iframe())
          .alert({
            message: "Authorized to ConfigCat 🎉",
            duration: 5,
            display: "success",
          });
      });

  }

  removeAuthorizationParameters(trelloPowerUpCallbackHandler: CallbackHandler | null = null) {
    return (trelloPowerUpCallbackHandler ?? trelloPowerUp.iframe()).clearSecret("authorization");
  }

  getCardSettingData(trelloPowerUpCallbackHandler: CallbackHandler | null = null): Promise<CardSettingData> {
    return (trelloPowerUpCallbackHandler ?? trelloPowerUp.iframe()).get("card", "shared", "cardSettingData");
  }

  setCardSettingData(cardData: CardSettingData, trelloPowerUpCallbackHandler: CallbackHandler | null = null): Promise<void> {
    return (trelloPowerUpCallbackHandler ?? trelloPowerUp.iframe()).set("card", "shared", "cardSettingData", cardData);
  }

  removeCardSettingData(trelloPowerUpCallbackHandler: CallbackHandler | null = null): Promise<void> {
    return (trelloPowerUpCallbackHandler ?? trelloPowerUp.iframe()).remove("card", "shared", "cardSettingData");
  }

  updateCardSettingDataLastUpdatedAt(trelloPowerUpCallbackHandler: CallbackHandler | null = null) {
    return this.getCardSettingData(trelloPowerUpCallbackHandler).then(setting => {
      if (!setting) {
        setting = { lastUpdatedAt: new Date() };
      }

      setting.lastUpdatedAt = new Date();
      return this.setCardSettingData(setting, trelloPowerUpCallbackHandler);
    });
  }

  removeSetting(environmentId: string, settingId: number, trelloPowerUpCallbackHandler: CallbackHandler | null = null) {
    return Promise.all([
      this.getAuthorizationParameters(trelloPowerUpCallbackHandler),
      this.getCardData(trelloPowerUpCallbackHandler),
    ]).then(value => {
      const authorizationParameters = value[0];
      const card = value[1];

      return this.publicApiService
        .createIntegrationLinksService(authorizationParameters.basicAuthUsername, authorizationParameters.basicAuthPassword)
        .deleteIntegrationLink(environmentId, settingId, IntegrationLinkType.Trello, card.id)
        .subscribe({
          next: deleteModel => {
            if (!deleteModel.hasRemainingIntegrationLink) {
              void this.removeCardSettingData(trelloPowerUpCallbackHandler);
            } else {
              void this.updateCardSettingDataLastUpdatedAt(trelloPowerUpCallbackHandler);
            }
          },
        }
        );
    });
  }

  render(func: () => void, trelloPowerUpIFrame: IFrame | null = null) {
    return (trelloPowerUpIFrame ?? trelloPowerUp.iframe()).render(func);
  }

  getCardData(trelloPowerUpCallbackHandler: CallbackHandler | null = null) {
    return (trelloPowerUpCallbackHandler ?? trelloPowerUp.iframe()).card("id", "name", "url");
  }

  getBadgeData(trelloPowerUpCallbackHandler: CallbackHandler | null = null): Promise<CardBadge[]> {
    return Promise.all([
      this.getAuthorizationParameters(trelloPowerUpCallbackHandler),
      this.getCardSettingData(trelloPowerUpCallbackHandler),
      this.getCardData(trelloPowerUpCallbackHandler),
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

  showHttpUnauthorizedAlert(trelloPowerUpIFrame: IFrame | null = null) {
    return (trelloPowerUpIFrame ?? trelloPowerUp.iframe())
      .alert({
        message: "Authorization failed. Please try to log in again.",
        duration: 5,
        display: "error",
      });
  }

}
