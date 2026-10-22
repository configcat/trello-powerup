import { CdkScrollable } from "@angular/cdk/scrolling";
import { HttpErrorResponse } from "@angular/common/http";
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, OnInit, viewChild } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatDialog } from "@angular/material/dialog";
import { EvaluationVersion, IntegrationLinkDetail, IntegrationLinkType } from "ng-configcat-publicapi";
import {
  AuthorizationComponent,
  DEFAULT_CUSTOMIZE_FEATURE_FLAG,
  DeleteSettingDialogComponent,
  DeleteSettingDialogData,
  DeleteSettingDialogResult,
  DeleteSettingModel,
  FeatureFlagItemComponent,
  ICustomizeFeatureFlag,
  LoaderComponent,
  PublicApiService,
  SettingItemComponent,
} from "ng-configcat-publicapi-ui";
import { IFrame } from "trellopowerup/lib/powerup";
import { AuthorizationParameters } from "../models/authorization-parameters";
import { AuthService } from "../services/auth.service";
import { ErrorHandler } from "../services/error-handler";
import { TrelloService } from "../services/trello-service";

@Component({
  selector: "configcat-trello-feature-flags-settings",
  templateUrl: "./feature-flags-settings.component.html",
  styleUrls: ["./feature-flags-settings.component.scss"],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AuthorizationComponent, SettingItemComponent, FeatureFlagItemComponent, LoaderComponent, CdkScrollable],
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
    this.authService.authParametersSource.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(authParameters => {
      this.authorizationParameters = authParameters;
    });

    this.trelloPowerUpIframe = this.trelloService.iframe();
    this.trelloService.render(() => {
      this.reloadSettings();
    }, this.trelloPowerUpIframe);

    void this.loadSettings();
  }

  reloadSettings(): void {
    void this.reloadSettingsInternal();
  }

  private async loadSettings(): Promise<void> {
    this.loading = true;
    this.showError = false;
    try {
      const [authorizationParameters, card, cardSettingData] = await Promise.all([
        this.authService.getAuthorizationParmeters(this.trelloPowerUpIframe),
        this.trelloService.getCardData(this.trelloPowerUpIframe),
        this.trelloService.getCardSettingData(this.trelloPowerUpIframe),
      ]);
      this.authorizationParameters = authorizationParameters;
      if (cardSettingData !== null && authorizationParameters) {
        this.fetchIntegrationLinks(authorizationParameters, card.id);
      }
      this.loading = false;
    } catch (error: unknown) {
      if (error instanceof HttpErrorResponse && error?.status === 401) {
        this.authService
          .removeAuthorizationParameters()
          .then(() => {
            this.trelloService.showHttpUnauthorizedAlert().catch((e: unknown) => console.error(e));
          })
          .catch((e: unknown) => console.error(e));
      } else {
        this.showError = true;
      }
      this.integrationLinkDetails = null;
      this.loading = false;
      console.log(error);
    }
  }

  private async reloadSettingsInternal(): Promise<void> {
    this.loading = true;
    this.showError = false;
    try {
      const cardSettingData = await this.trelloService.getCardSettingData(this.trelloPowerUpIframe);
      if (cardSettingData?.skipRenderer) {
        this.loading = false;
        return;
      }
      const [authorizationParameters, card] = await Promise.all([
        this.authService.getAuthorizationParmeters(this.trelloPowerUpIframe),
        this.trelloService.getCardData(this.trelloPowerUpIframe),
      ]);
      this.authorizationParameters = authorizationParameters;
      if (!authorizationParameters) {
        this.integrationLinkDetails = null;
        this.loading = false;
        return;
      }
      this.fetchIntegrationLinks(authorizationParameters, card.id);
    } catch (error: unknown) {
      console.log(error);
      this.showError = true;
      this.loading = false;
      const errorMessage = ErrorHandler.getErrorMessage(error as Error);
      void this.trelloService.showErrorAlert(errorMessage);
    }
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
        void this.trelloService.removeSetting(data.environment.environmentId, data.setting.settingId).then(() => {
          this.reloadSettings();
        });
      }
    });
  }

  saveSucceeded() {
    void this.trelloService.setCardSettingData({ lastUpdatedAt: new Date(), skipRenderer: true });
  }

  loadFailed(error: Error) {
    console.error(error);
    const errorMessage = ErrorHandler.getErrorMessage(error);
    void this.trelloService.showErrorAlert(errorMessage);
  }

  componentError(error: Error) {
    console.error(error);
    this.reloadSettings();
    const errorMessage = ErrorHandler.getErrorMessage(error);
    void this.trelloService.showErrorAlert(errorMessage);
  }

  private fetchIntegrationLinks(authorizationParameters: AuthorizationParameters, cardId: string) {
    this.publicApiService
      .createIntegrationLinksService(
        authorizationParameters.basicAuthUsername,
        authorizationParameters.basicAuthPassword
      )
      .getIntegrationLinkDetails(IntegrationLinkType.Trello, cardId)
      .subscribe({
        next: integrationLinkDetails => {
          this.integrationLinkDetails = integrationLinkDetails.details;
          this.loading = false;
        },
        error: (error: Error) => {
          this.handleFetchError(error);
        },
      });
  }

  private handleFetchError(error: Error) {
    console.error(error);
    this.loading = false;
    this.showError = true;
    let errorMessage: string | null;
    if (error instanceof HttpErrorResponse && error?.status === 401) {
      errorMessage = "Unauthorized access. Check your credentials and try again.";
    } else {
      errorMessage = ErrorHandler.getErrorMessage(error);
    }
    void this.trelloService.showErrorAlert(errorMessage);
  }

  login(authorizationParameters: AuthorizationParameters) {
    this.authService
      .setAuthorizationParameters(authorizationParameters)
      .then(() => {
        this.reloadSettings();
      })
      .catch(() => {
        console.log("authService setAuthorizationParameters failed.");
      });
  }

  getFeatureFlagCustomizeSettings(): ICustomizeFeatureFlag {
    return { ...DEFAULT_CUSTOMIZE_FEATURE_FLAG, menuDeleteSettingText: "Remove from card" };
  }
}
