import { HttpErrorResponse } from "@angular/common/http";
import { Component, DOCUMENT, inject, OnInit } from "@angular/core";
import { IntegrationLinkType } from "ng-configcat-publicapi";
import { AuthorizationComponent, AuthorizationModel, LinkFeatureFlagComponent, LinkFeatureFlagParameters, PublicApiService } from "ng-configcat-publicapi-ui";
import { AuthorizationParameters } from "../models/authorization-parameters";
import { ErrorHandler } from "../services/error-handler";
import { TrelloService } from "../services/trello-service";

@Component({
  selector: "configcat-trello-add-feature-flag",
  templateUrl: "./add-feature-flag.component.html",
  styleUrls: ["./add-feature-flag.component.scss"],
  imports: [
    AuthorizationComponent,
    LinkFeatureFlagComponent,
  ],
})
export class AddFeatureFlagComponent implements OnInit {

  private readonly trelloService = inject(TrelloService);
  private readonly publicApiService = inject(PublicApiService);
  private readonly document = inject<Document>(DOCUMENT);

  authorizationParameters!: AuthorizationParameters;
  errorText: string | null = null;

  ngOnInit(): void {
    this.init();
  }

  init() {
    this.trelloService.getAuthorizationParameters().then(value => { this.authorizationParameters = value; }).catch(() => {
      console.log("trelloService getAuthorizationParameters failed.");
    });
    this.resize();
  }

  login(authorizationModel: AuthorizationModel) {
    this.trelloService
      .setAuthorizationParameters({ basicAuthUsername: authorizationModel.basicAuthUsername, basicAuthPassword: authorizationModel.basicAuthPassword })
      .then(() => {
        this.init();
      })
      .catch(() => {
        console.log("trelloService setAuthorizationParameters failed.");
      });
  }

  error() {
    this.resize();
  }

  add(linkFeatureFlagParameters: LinkFeatureFlagParameters) {

    this.trelloService.getCardData().then(
      card => this.publicApiService
        .createIntegrationLinksService(this.authorizationParameters.basicAuthUsername, this.authorizationParameters.basicAuthPassword)
        .addOrUpdateIntegrationLink(
          linkFeatureFlagParameters.environmentId,
          linkFeatureFlagParameters.settingId,
          IntegrationLinkType.Trello, card.id,
          { description: card.name, url: card.url })
        .subscribe({
          next: () => {
            void this.trelloService.setCardSettingData({ lastUpdatedAt: new Date() })
              .then(() => {
                return this.trelloService.closeModal();
              });
          },
          error: (error: Error) => {
            let errorMessage: string;
            if (error instanceof HttpErrorResponse && error?.status === 409) {
              errorMessage = "Integration link already exists.";
            } else {
              errorMessage = ErrorHandler.getErrorMessage(error);
            }
            void this.trelloService.showErrorAlert(errorMessage);
            console.log(error);
          },
        })
    ).catch((error: unknown) => {
      void this.trelloService.showErrorAlert(ErrorHandler.getErrorMessage(error as Error));
      console.log(error);
    });

  }

  selectDropdownPanelChanged(event: boolean) {
    if (!event) {
      this.resize();
    } else {
      this.resize(".cdk-overlay-container");
    }

  }

  resize(selector?: string) {
    setTimeout(() => {
      if (selector === ".cdk-overlay-container") {
        //element height calculation based on trello sizeTo method + 15 px
        const el = this.document.querySelector(selector);
        if (el) {
          const requestedHeight = Math.ceil(Math.max(el.scrollHeight, el.getBoundingClientRect().height));
          void this.trelloService.sizeToHeight(requestedHeight + 15);
        }
      } else {
        void this.trelloService.sizeTo("#outer");
      }
    }, 200);
  }
}
