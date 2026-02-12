import { inject, Injectable } from "@angular/core";
import { IntegrationLinkDetail, IntegrationLinkType } from "ng-configcat-publicapi";
import { PublicApiService } from "ng-configcat-publicapi-ui";
import { firstValueFrom } from "rxjs";
import { CallbackHandler, CardBadge, IFrame } from "trellopowerup/lib/powerup";
import { AuthorizationParameters } from "../models/authorization-parameters";
import { CardSettingData } from "../models/card-setting-data";

const CONFIGCAT_ICON = "./assets/cat_red.svg";

type TrelloFrame = CallbackHandler | IFrame | null;

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

  closeModal() {
    return window["TrelloPowerUp"].iframe().closeModal();
  }

  sizeTo(selector: string) {
    return window["TrelloPowerUp"].iframe().sizeTo(selector);
  }

  sizeToHeight(height: number, t: TrelloFrame = null) {
    return (t ?? window["TrelloPowerUp"].iframe()).sizeTo(height);
  }

  getAuthorizationParameters(t: TrelloFrame = null): Promise<AuthorizationParameters> {
    return (t ?? window["TrelloPowerUp"].iframe()).loadSecret("authorization").then((authorizationParameters: string) => {
      return JSON.parse(authorizationParameters) as AuthorizationParameters;
    });
  }

  setAuthorizationParameters(authorizationParameters: AuthorizationParameters, setCardSettingData = true, t: TrelloFrame = null): Promise<void> {
    return (t ?? window["TrelloPowerUp"].iframe()).storeSecret("authorization", JSON.stringify(authorizationParameters))
      .then(() => {
        if (setCardSettingData) {
          return this.setCardSettingData({ lastUpdatedAt: new Date() }, t);
        }
        return;
      })
      .then(() => {
        console.log("The auth success");
        return void (t ?? window["TrelloPowerUp"].iframe())
          .alert({
            message: "Authorized to ConfigCat 🎉",
            duration: 5,
            display: "success",
          });
      });

  }

  removeAuthorizationParameters(t: TrelloFrame = null) {
    return (t ?? window["TrelloPowerUp"].iframe()).clearSecret("authorization");
  }

  getCardSettingData(t: TrelloFrame = null): Promise<CardSettingData | null> {
    return (t ?? window["TrelloPowerUp"].iframe()).get("card", "shared", "cardSettingData", null);
  }

  setCardSettingData(cardData: CardSettingData, t: TrelloFrame = null): Promise<void> {
    return (t ?? window["TrelloPowerUp"].iframe()).set("card", "shared", "cardSettingData", cardData);
  }

  setCardSettingDataAndUrlPostfix(cardData: CardSettingData, t: TrelloFrame = null): Promise<void> {
    return (t ?? window["TrelloPowerUp"].iframe()).set("card", "shared", { "cardSettingData": cardData, "urlPostfix": "?d=" + (new Date()).toISOString() });
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
      setting.skipRenderer = false;
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
              text: linkDetails.details!.length > 1 ? this.convertDetailDataToText(detail) : detail.status,
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

  convertDetailDataToText(detail: IntegrationLinkDetail): string {
    let detailName = detail.setting.name;
    if (detailName.length > 19) {
      detailName = detailName.slice(0, 19) + "...";
    }
    return detailName + ": " + detail.status;
  }

  showErrorAlert(message: string) {
    return window["TrelloPowerUp"].iframe()
      .alert({
        message: message,
        duration: 5,
        display: "error",
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
