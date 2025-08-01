import { inject, Injectable } from "@angular/core";
import { IntegrationLinkType } from "ng-configcat-publicapi";
import { PublicApiService } from "ng-configcat-publicapi-ui";
import { firstValueFrom } from "rxjs";
import { CallbackHandler, CardBackSection, CardBadge, CardButton } from "trellopowerup/lib/powerup";
import { AuthorizationParameters } from "../models/authorization-parameters";
import { CardSettingData } from "../models/card-setting-data";

const CONFIGCAT_ICON = "./assets/cat_red.svg";

@Injectable({
  providedIn: "root",
})
export class TrelloService {
  private readonly publicApiService = inject(PublicApiService);
  private readonly trelloPowerUp = window["TrelloPowerUp"];

  initialize() {
    // trelloPowerUp = window["TrelloPowerUp"];
    this.trelloPowerUp.initialize({
      "card-back-section": this.getCardBackSection,
      "card-buttons": this.getCardButtons,
      "authorization-status": this.getAuthorizationStatus,
      "show-authorization": this.showAuthorization,
      "on-disable": this.disable,
      "card-badges": this.getBadges,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private readonly getBadges = (_t: CallbackHandler) => {
    return this.getBadgeData();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private readonly disable = (_t: CallbackHandler) => {
    return this.removeAuthorizationParameters();
  };

  private readonly showAuthorization = () => {
    void this.trelloPowerUp.iframe().popup({
      title: "Authorize ConfigCat",
      url: "./authorize",
      height: 300,
    });
  };

  private readonly getAuthorizationStatus = () => {
    this.getAuthorizationParameters()
      .then(authorizationParameters => {
        if (authorizationParameters?.basicAuthUsername && authorizationParameters?.basicAuthPassword) {
          return { authorized: true };
        }
        return { authorized: false };
      })
      .catch(() => ({ authorized: false }));
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private readonly getCardButtons = (_t: CallbackHandler) => {
    return Promise.resolve([{
      // usually you will provide a callback function to be run on button click
      // we recommend that you use a popup on click generally
      icon: CONFIGCAT_ICON,
      text: "Link Feature Flag",
      callback: (t: CallbackHandler) => {
        return t.popup({
          title: "Link Feature Flag",
          url: "./addfeatureflag",
          height: 380,
        });
      },
    } as CardButton,
    {
      // usually you will provide a callback function to be run on button click
      // we recommend that you use a popup on click generally
      icon: CONFIGCAT_ICON,
      text: "Create and Link Feature Flag",
      callback: (t: CallbackHandler) => {
        return t.popup({
          title: "Create and Link Feature Flag",
          url: "./createfeatureflag",
          height: 380,
        });
      },
    } as CardButton]);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private readonly getCardBackSection = (_t: CallbackHandler) => {
    return this.getCardSettingData()
      .then(setting => {
        if (setting) {
          return {
            title: "ConfigCat",
            icon: CONFIGCAT_ICON, // Must be a gray icon, colored icons not allowed.
            content: {
              type: "iframe",
              url: this.trelloPowerUp.iframe().signUrl("./featureflags"),
            },
          } as CardBackSection;
        } else {
          // This should be an empty Card Back section
          return {
            title: "ConfigCat",
            icon: CONFIGCAT_ICON, // Must be a gray icon, colored icons not allowed.
            content: {
              type: "iframe",
              url: "",
            },
          } as CardBackSection;
        }
      });
  };

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
