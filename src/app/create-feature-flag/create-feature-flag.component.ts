import { HttpErrorResponse } from "@angular/common/http";
import { Component, inject, OnInit } from "@angular/core";
import { IntegrationLinkType, SettingType } from "ng-configcat-publicapi";
import { AuthorizationComponent, AuthorizationModel, CreateFeatureFlagComponent, FormHelper, LinkFeatureFlagParameters, PublicApiService } from "ng-configcat-publicapi-ui";
import { AuthorizationParameters } from "../models/authorization-parameters";
import { ErrorHandler } from "../services/error-handler";
import { TrelloService } from "../services/trello-service";

@Component({
  selector: "configcat-trello-create-feature-flag",
  templateUrl: "./create-feature-flag.component.html",
  styleUrls: ["./create-feature-flag.component.scss"],
  imports: [
    AuthorizationComponent,
    CreateFeatureFlagComponent,
  ],
})
export class CreateLinkFeatureFlagComponent implements OnInit {
  private readonly trelloService = inject(TrelloService);
  private readonly publicApiService = inject(PublicApiService);

  authorizationParameters!: AuthorizationParameters;
  SettingTypeEnum = SettingType;
  ErrorHandler = ErrorHandler;
  FormHelper = FormHelper;

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
      }).catch(() => {
        console.log("trelloService setAuthorizationParameters failed.");
      });
  }

  error() {
    this.resize();
  }

  add(linkFeatureFlagParameters: LinkFeatureFlagParameters) {
    this.trelloService.getCardData()
      .then(
        card => {
          this.publicApiService
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
            });
        }
      )
      .catch((error: unknown) => {
        void this.trelloService.showErrorAlert(ErrorHandler.getErrorMessage(error as Error));
        console.log(error);
      });
  }

  resize() {
    setTimeout(() => {
      this.trelloService.sizeTo("#outer").catch(() => {
        console.log("trelloService sizeTo failed.");
      });
    }, 300);
  }
}
