import { HttpErrorResponse } from "@angular/common/http";
import { Component, DestroyRef, ElementRef, inject, OnInit, viewChild } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatDialog } from "@angular/material/dialog";
import { EvaluationVersion, IntegrationLinkDetail, IntegrationLinkType } from "ng-configcat-publicapi";
import { AuthorizationComponent, DeleteSettingDialogComponent, DeleteSettingDialogData, DeleteSettingDialogResult, DeleteSettingModel, FeatureFlagItemComponent, LoaderComponent, PublicApiService, SettingItemComponent } from "ng-configcat-publicapi-ui";
import { IFrame } from "trellopowerup/lib/powerup";
import { AuthorizationParameters } from "../models/authorization-parameters";
import { AuthService } from "../services/auth.service";
import { ErrorHandler } from "../services/error-handler";
import { TrelloService } from "../services/trello-service";

@Component({
  selector: "configcat-trello-feature-flags-settings",
  templateUrl: "./feature-flags-settings.component.html",
  styleUrls: ["./feature-flags-settings.component.scss"],
  imports: [AuthorizationComponent, SettingItemComponent, FeatureFlagItemComponent, LoaderComponent],
})
export class FeatureFlagsSettingsComponent implements OnInit {

  private readonly dialog = inject(MatDialog);
  private readonly publicApiService = inject(PublicApiService);
  private readonly authService = inject(AuthService);
  private readonly trelloService = inject(TrelloService);
  private readonly destroyRef = inject(DestroyRef);

  loading = true;
  showError = false;
  authorizationParameters!: AuthorizationParameters | null;
  integrationLinkDetails: IntegrationLinkDetail[] | null = null;
  EvaluationVersion = EvaluationVersion;

  trelloPowerUpIframe!: IFrame;

  readonly elementView = viewChild<ElementRef<HTMLElement>>("settingItem");

  ngOnInit(): void {
    this.authService.authParametersSource
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(authParameters => {
        this.authorizationParameters = authParameters;
      });

    this.trelloPowerUpIframe = this.trelloService.iframe();
    this.trelloService.render(() => { this.reloadSettings(); }, this.trelloPowerUpIframe);
    this.loading = true;
    this.showError = false;
    Promise.all([
      this.authService.getAuthorizationParmeters(this.trelloPowerUpIframe),
      this.trelloService.getCardData(this.trelloPowerUpIframe),
      this.trelloService.getCardSettingData(this.trelloPowerUpIframe),
    ]).then(value => {
      this.authorizationParameters = value[0];
      const card = value[1];
      const cardSettingData = value[2];
      const authorizationParameters = this.authorizationParameters;
      if (cardSettingData === null) {
        return;
      }
      if (!authorizationParameters) {
        this.loading = false;
        this.resize();
        return;
      }
      this.fetchIntegrationLinks(authorizationParameters, card.id);
    })
      .then(() => {
        this.loading = false;
        this.resize();
      })
      .catch((error: unknown) => {
        if (error instanceof HttpErrorResponse && error?.status === 401) {
          this.authService.removeAuthorizationParameters().then(() => {
            this.trelloService.showHttpUnauthorizedAlert().catch((e: unknown) => console.error(e));
          }).catch((e: unknown) => console.error(e));
        } else {
          this.showError = true;
        }
        this.integrationLinkDetails = null;
        this.loading = false;
        this.resize();
        console.log(error);
      });
  }

  reloadSettings() {
    void this.trelloService.getCardSettingData(this.trelloPowerUpIframe).then(cardSettingData => {
      if (cardSettingData?.skipRenderer) {
        return;
      }
      this.loading = true;
      this.showError = false;
      Promise.all([
        this.authService.getAuthorizationParmeters(this.trelloPowerUpIframe),
        this.trelloService.getCardData(this.trelloPowerUpIframe),
      ]).then(value => {
        this.authorizationParameters = value[0];
        const card = value[1];
        const authorizationParameters = this.authorizationParameters;
        if (!authorizationParameters) {
          this.integrationLinkDetails = null;
          this.loading = false;
          this.resize();
          return;
        }
        this.fetchIntegrationLinks(authorizationParameters, card.id);
      })
        .catch((error: unknown) => {
          if (error instanceof Error) {
            const errorMessage = ErrorHandler.getErrorMessage(error);
            this.trelloService.showErrorAlert(errorMessage).catch((e: unknown) => console.error(e));
          }
          this.showError = true;
          this.loading = false;
          this.resize();
          console.log(error);
        });
    });
  }

  onDeleteSettingRequested(data: DeleteSettingModel) {
    const dialogRef = this.dialog.open<
      DeleteSettingDialogComponent,
      DeleteSettingDialogData,
      DeleteSettingDialogResult
    >(DeleteSettingDialogComponent, {
      data: {
        system: "Trello",
        ticketType: "card",
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }
      if (result.button === "remove") {
        void this.trelloService.removeSetting(data.environment.environmentId, data.setting.settingId)
          .then(() => {
            this.reloadSettings();
          });
      }
    });
  }

  loadSucceeded() {
    this.resize();
  }

  expandedStateChanged() {
    this.resize();
  }

  saveSucceeded() {
    void this.trelloService.setCardSettingData({ lastUpdatedAt: new Date(), skipRenderer: true });
  }

  componentError(error: Error) {
    const errorMessage = ErrorHandler.getErrorMessage(error);
    this.trelloService.showErrorAlert(errorMessage).catch((e: unknown) => console.error(e));
    this.reloadSettings();
  }

  private fetchIntegrationLinks(authorizationParameters: AuthorizationParameters, cardId: string) {
    this.publicApiService
      .createIntegrationLinksService(authorizationParameters.basicAuthUsername, authorizationParameters.basicAuthPassword)
      .getIntegrationLinkDetails(IntegrationLinkType.Trello, cardId)
      .subscribe({
        next: (integrationLinkDetails) => {
          this.integrationLinkDetails = integrationLinkDetails.details;
          this.loading = false;
          this.resize();
        },
        error: (error: Error) => {
          this.handleFetchError(error);
        },
      });
  }

  private handleFetchError(error: Error) {
    let errorMessage: string;
    if (error instanceof HttpErrorResponse && error?.status === 401) {
      errorMessage = "Unauthorized access. Check your credentials and try again.";
    } else {
      errorMessage = ErrorHandler.getErrorMessage(error);
    }
    this.trelloService.showErrorAlert(errorMessage).catch((e: unknown) => console.error(e));
    this.loading = false;
    this.showError = true;
    console.log(error);
  }

  onFormValuesChanged() {
    this.resize();
  }

  resize() {
    setTimeout(() => {
      const contentHeight = this.elementView()?.nativeElement?.offsetHeight;
      const height = contentHeight && contentHeight < 700 ? contentHeight : 700;
      void this.trelloService.sizeToHeight(height, this.trelloPowerUpIframe);
    }, 300);
  }

  login(authorizationParameters: AuthorizationParameters) {
    this.authService
      .setAuthorizationParameters(authorizationParameters)
      .then(() => {
        this.reloadSettings();
      }).catch(() => {
        console.log("authService setAuthorizationParameters failed.");
      });
  }

  error() {
    this.resize();
  }

}
