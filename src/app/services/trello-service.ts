import { inject, Injectable } from "@angular/core";
import { IntegrationLinkType } from "ng-configcat-publicapi";
import { PublicApiService } from "ng-configcat-publicapi-ui";
import { firstValueFrom } from "rxjs";
import { CallbackHandler, CardBadge, IFrame } from "trellopowerup/lib/powerup";
import { AuthorizationParameters } from "../models/authorization-parameters";
import { CardSettingData } from "../models/card-setting-data";

const CONFIGCAT_ICON = "./assets/cat_red.svg";

@Injectable({
  providedIn: "root",
})
export class TrelloService {
  private readonly publicApiService = inject(PublicApiService);

  iframe(): IFrame {
    return window["TrelloPowerUp"].iframe();
  }

  closePopup() {
    return window["TrelloPowerUp"].iframe().closePopup();
  }

  sizeTo(selector: string) {
    return window["TrelloPowerUp"].iframe().sizeTo(selector);
  }

  sizeToHeight(height: number, t: CallbackHandler | IFrame | null = null) {
    return (t ?? window["TrelloPowerUp"].iframe()).sizeTo(height);
  }

  getAuthorizationParameters(t: CallbackHandler | IFrame | null = null): Promise<AuthorizationParameters> {
    return (t ?? window["TrelloPowerUp"].iframe()).loadSecret("authorization").then((authorizationParameters: string) => {
      return JSON.parse(authorizationParameters) as AuthorizationParameters;
    });
  }

  setAuthorizationParameters(authorizationParameters: AuthorizationParameters, t: CallbackHandler | IFrame | null = null): Promise<void> {
    return (t ?? window["TrelloPowerUp"].iframe()).storeSecret("authorization", JSON.stringify(authorizationParameters))
      .then(() => {
        return this.setCardSettingData({ lastUpdatedAt: new Date() }, t);
      })
      .finally(() => {
        return void (t ?? window["TrelloPowerUp"].iframe())
          .alert({
            message: "Authorized to ConfigCat 🎉",
            duration: 5,
            display: "success",
          });
      });

  }

  removeAuthorizationParameters(t: CallbackHandler | IFrame | null = null) {
    return (t ?? window["TrelloPowerUp"].iframe()).clearSecret("authorization");
  }

  getCardSettingData(t: CallbackHandler | IFrame | null = null): Promise<CardSettingData> {
    return (t ?? window["TrelloPowerUp"].iframe()).get("card", "shared", "cardSettingData");
  }

  setCardSettingData(cardData: CardSettingData, t: CallbackHandler | IFrame | null = null): Promise<void> {
    return (t ?? window["TrelloPowerUp"].iframe()).set("card", "shared", "cardSettingData", cardData);
  }

  removeCardSettingData(): Promise<void> {
    return window["TrelloPowerUp"].iframe().remove("card", "shared", "cardSettingData");
  }

  updateCardSettingDataLastUpdatedAt() {
    return this.getCardSettingData().then(setting => {
      if (!setting) {
        setting = { lastUpdatedAt: new Date() };
      }

      setting.lastUpdatedAt = new Date();
      return this.setCardSettingData(setting);
    });
  }

  removeSetting(environmentId: string, settingId: number) {
    return Promise.all([
      this.getAuthorizationParameters(),
      this.getCardData(),
    ]).then(value => {
      const authorizationParameters = value[0];
      const card = value[1];

      return this.publicApiService
        .createIntegrationLinksService(authorizationParameters.basicAuthUsername, authorizationParameters.basicAuthPassword)
        .deleteIntegrationLink(environmentId, settingId, IntegrationLinkType.Trello, card.id)
        .subscribe({
          next: deleteModel => {
            if (!deleteModel.hasRemainingIntegrationLink) {
              void this.removeCardSettingData();
            } else {
              void this.updateCardSettingDataLastUpdatedAt();
            }
          },
        }
        );
    });
  }

  render(func: () => void, t: IFrame | null = null) {
    return (t ?? window["TrelloPowerUp"].iframe()).render(func);
  }

  getCardData(t: CallbackHandler | IFrame | null = null) {
    return (t ?? window["TrelloPowerUp"].iframe()).card("id", "name", "url");
  }

  getBadgeData(t: CallbackHandler): Promise<CardBadge[]> {
    return Promise.all([
      this.getAuthorizationParameters(t),
      this.getCardSettingData(t),
      this.getCardData(t),
    ]).then(value => {
      const authorizationParameters = value[0];
      const setting = value[1];
      const card = value[2];

      if (!setting || !card || !authorizationParameters) {
        return [] as CardBadge[];
      }

      return firstValueFrom(this.publicApiService
        .createIntegrationLinksService(authorizationParameters.basicAuthUsername, authorizationParameters.basicAuthPassword)
        .getIntegrationLinkDetails(IntegrationLinkType.Trello, card.id)).then(linkDetails => {
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
      }).catch(() => {
        /* intentionally empty */
        return [] as CardBadge[];
      });

    });
  }

  showHttpUnauthorizedAlert() {
    return window["TrelloPowerUp"].iframe()
      .alert({
        message: "Authorization failed. Please try to log in again.",
        duration: 5,
        display: "error",
      });
  }

}
