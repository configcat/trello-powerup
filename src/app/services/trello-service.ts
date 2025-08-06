import { inject, Injectable } from "@angular/core";
import { IntegrationLinkType } from "ng-configcat-publicapi";
import { PublicApiService } from "ng-configcat-publicapi-ui";
import { firstValueFrom } from "rxjs";
import { CardBadge } from "trellopowerup/lib/powerup";
import { AuthorizationParameters } from "../models/authorization-parameters";
import { CardSettingData } from "../models/card-setting-data";

const CONFIGCAT_ICON = "./assets/cat_red.svg";

@Injectable({
  providedIn: "root",
})
export class TrelloService {
  private readonly publicApiService = inject(PublicApiService);
  private readonly trelloPowerUp = window["TrelloPowerUp"];

  closePopup() {
    return this.trelloPowerUp.iframe().closePopup();
  }

  sizeTo(selector: string) {
    return this.trelloPowerUp.iframe().sizeTo(selector);
  }

  sizeToHeight(height: number) {
    return this.trelloPowerUp.iframe().sizeTo(height);
  }

  getAuthorizationParameters(): Promise<AuthorizationParameters> {
    return this.trelloPowerUp.iframe().loadSecret("authorization").then((authorizationParameters: string) => {
      return JSON.parse(authorizationParameters) as AuthorizationParameters;
    });
  }

  setAuthorizationParameters(authorizationParameters: AuthorizationParameters): Promise<void> {
    return this.trelloPowerUp.iframe().storeSecret("authorization", JSON.stringify(authorizationParameters))
      .then(() => {
        return this.setCardSettingData({ lastUpdatedAt: new Date() });
      })
      .finally(() => {
        return void this.trelloPowerUp.iframe()
          .alert({
            message: "Authorized to ConfigCat 🎉",
            duration: 5,
            display: "success",
          });
      });

  }

  removeAuthorizationParameters() {
    return this.trelloPowerUp.iframe().clearSecret("authorization");
  }

  getCardSettingData(): Promise<CardSettingData> {
    return this.trelloPowerUp.iframe().get("card", "shared", "cardSettingData");
  }

  setCardSettingData(cardData: CardSettingData): Promise<void> {
    return this.trelloPowerUp.iframe().set("card", "shared", "cardSettingData", cardData);
  }

  removeCardSettingData(): Promise<void> {
    return this.trelloPowerUp.iframe().remove("card", "shared", "cardSettingData");
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

  render(func: () => void) {
    return this.trelloPowerUp.iframe().render(func);
  }

  getCardData() {
    return this.trelloPowerUp.iframe().card("id", "name", "url");
  }

  getBadgeData(): Promise<CardBadge[]> {
    return Promise.all([
      this.getAuthorizationParameters(),
      this.getCardSettingData(),
      this.getCardData(),
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
    return this.trelloPowerUp.iframe()
      .alert({
        message: "Authorization failed. Please try to log in again.",
        duration: 5,
        display: "error",
      });
  }

}
