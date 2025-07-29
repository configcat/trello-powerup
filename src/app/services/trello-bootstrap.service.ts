import { inject, Injectable } from "@angular/core";
import { CallbackHandler, CardBackSection, CardButton } from "trellopowerup/lib/powerup";
import { TrelloService } from "./trello-service";

const CONFIGCAT_ICON = "./assets/cat_red.svg";

// eslint-disable-next-line @typescript-eslint/naming-convention
declare let TrelloPowerUp: Trello.PowerUp.PowerUp;

@Injectable({
  providedIn: "root",
})
export class TrelloBootstrapService {
  private readonly trelloService = inject(TrelloService);

  initialize() {
    TrelloPowerUp.initialize({
      "card-back-section": this.getCardBackSection,
      "card-buttons": this.getCardButtons,
      "authorization-status": this.getAuthorizationStatus,
      "show-authorization": this.showAuthorization,
      "on-disable": this.disable,
      "card-badges": this.getBadges,
    });
  }

  private readonly getBadges = (t: CallbackHandler) => {
    return this.trelloService.getBadgeData(t);
  };

  private readonly disable = (t: CallbackHandler) => {
    return this.trelloService.removeAuthorizationParameters(t);
  };

  private readonly showAuthorization = () => {
    void TrelloPowerUp.iframe().popup({
      title: "Authorize ConfigCat",
      url: "./authorize",
      height: 300,
    });
  };

  private readonly getAuthorizationStatus = () => {
    this.trelloService.getAuthorizationParameters()
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

  private readonly getCardBackSection = (t: CallbackHandler) => {
    return this.trelloService.getCardSettingData(t)
      .then(setting => {
        if (setting) {
          return {
            title: "ConfigCat",
            icon: CONFIGCAT_ICON, // Must be a gray icon, colored icons not allowed.
            content: {
              type: "iframe",
              url: t.signUrl("./featureflags"),
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
}
