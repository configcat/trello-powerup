import { HttpErrorResponse } from "@angular/common/http";
import { DestroyRef, Directive, inject, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { IntegrationLinkType } from "ng-configcat-publicapi";
import { AuthorizationModel, LinkFeatureFlagParameters, PublicApiService } from "ng-configcat-publicapi-ui";
import { AuthorizationParameters } from "./models/authorization-parameters";
import { AuthService } from "./services/auth.service";
import { ErrorHandler } from "./services/error-handler";
import { TrelloService } from "./services/trello-service";

@Directive()
export abstract class BaseLinkFeatureFlagComponent implements OnInit {

  protected readonly authService = inject(AuthService);
  protected readonly trelloService = inject(TrelloService);
  protected readonly publicApiService = inject(PublicApiService);
  protected readonly destroyRef = inject(DestroyRef);

  authorizationParameters: AuthorizationParameters | null = null;

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
      this.trelloService.showHttpUnauthorizedAlert().catch((e: unknown) => console.error(e));
      return;
    }

    const authorizationParameters = this.authorizationParameters;

    this.trelloService.getCardData()
      .then(
        (card: { id: string; name: string; url: string }) => {
          this.publicApiService
            .createIntegrationLinksService(authorizationParameters.basicAuthUsername, authorizationParameters.basicAuthPassword)
            .addOrUpdateIntegrationLink(
              linkFeatureFlagParameters.environmentId,
              linkFeatureFlagParameters.settingId,
              IntegrationLinkType.Trello, card.id,
              { description: card.name, url: card.url })
            .subscribe({
              next: () => {
                this.trelloService.setCardSettingData({ lastUpdatedAt: new Date() })
                  .then(() => {
                    this.onAddSuccess(linkFeatureFlagParameters);
                    return this.trelloService.closeModal();
                  }).catch((e: unknown) => {
                    console.error(e);
                    this.trelloService.showErrorAlert(ErrorHandler.getErrorMessage(e as Error))
                      .catch((e: unknown) => console.error(e));
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
                this.onAddError(linkFeatureFlagParameters);
                this.trelloService.showErrorAlert(errorMessage).catch((e: unknown) => console.error(e));
                console.log(error);
              },
            });
        }
      )
      .catch((error: unknown) => {
        this.trelloService.showErrorAlert(ErrorHandler.getErrorMessage(error as Error))
          .catch((e: unknown) => console.error(e));
        console.log(error);
      });
  }

  componentError(error: Error) {
    const errorMessage = ErrorHandler.getErrorMessage(error);
    this.trelloService.showErrorAlert(errorMessage).catch((e: unknown) => console.error(e));
  }

  resize() {
    setTimeout(() => {
      this.trelloService.sizeTo("#outer").catch(() => {
        console.log("trelloService sizeTo failed.");
      });
    }, 300);
  }

  protected onAddSuccess(linkFeatureFlagParameters: LinkFeatureFlagParameters): void {
    linkFeatureFlagParameters.callback();
  }

  protected onAddError(linkFeatureFlagParameters: LinkFeatureFlagParameters): void {
    linkFeatureFlagParameters.callback();
  }
}
