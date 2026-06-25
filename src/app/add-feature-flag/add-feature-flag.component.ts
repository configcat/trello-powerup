import { HttpErrorResponse } from "@angular/common/http";
import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { IntegrationLinkType } from "ng-configcat-publicapi";
import { AuthorizationComponent, AuthorizationModel, LinkFeatureFlagComponent, LinkFeatureFlagParameters, PublicApiService } from "ng-configcat-publicapi-ui";
import { AuthorizationParameters } from "../models/authorization-parameters";
import { AuthService } from "../services/auth.service";
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

  private readonly authService = inject(AuthService);
  private readonly trelloService = inject(TrelloService);
  private readonly publicApiService = inject(PublicApiService);
  private readonly destroyRef = inject(DestroyRef);

  authorizationParameters: AuthorizationParameters | null = null;
  errorText: string | null = null;

  ngOnInit(): void {
    this.authService.authParametersSource
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(authParameters => {
        this.authorizationParameters = authParameters;
      });

    this.init();
  }

  init() {
    this.authService.getAuthorizationParmeters().then(value => { this.authorizationParameters = value; }).catch(() => {
      console.log("authService getAuthorizationParmeters failed.");
    });
    this.resize();
  }

  login(authorizationModel: AuthorizationModel) {
    this.authService
      .setAuthorizationParameters({ basicAuthUsername: authorizationModel.basicAuthUsername, basicAuthPassword: authorizationModel.basicAuthPassword })
      .then(() => {
        this.init();
      })
      .catch(() => {
        console.log("authService setAuthorizationParameters failed.");
      });
  }

  error() {
    this.resize();
  }

  add(linkFeatureFlagParameters: LinkFeatureFlagParameters) {
    if (!this.authorizationParameters) {
      void this.trelloService.showHttpUnauthorizedAlert();
      return;
    }
    const authorizationParameters = this.authorizationParameters;

    this.trelloService.getCardData().then(
      (card: { id: string; name: string; url: string }) => this.publicApiService
        .createIntegrationLinksService(authorizationParameters.basicAuthUsername, authorizationParameters.basicAuthPassword)
        .addOrUpdateIntegrationLink(
          linkFeatureFlagParameters.environmentId,
          linkFeatureFlagParameters.settingId,
          IntegrationLinkType.Trello, card.id,
          { description: card.name, url: card.url })
        .subscribe({
          next: () => {
            void this.trelloService.setCardSettingData({ lastUpdatedAt: new Date() })
              .then(() => {
                linkFeatureFlagParameters.callback();
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
            linkFeatureFlagParameters.callback();
            void this.trelloService.showErrorAlert(errorMessage);
            console.log(error);
          },
        })
    ).catch((error: unknown) => {
      void this.trelloService.showErrorAlert(ErrorHandler.getErrorMessage(error as Error));
      console.log(error);
    });

  }

  selectDropdownPanelChanged() {
    this.resize();
  }

  componentError(error: Error) {
    const errorMessage = ErrorHandler.getErrorMessage(error);
    void this.trelloService.showErrorAlert(errorMessage);
  }

  resize() {
    setTimeout(() => {
      void this.trelloService.sizeTo("#outer");
    }, 200);
  }
}
