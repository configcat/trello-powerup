import { HttpErrorResponse } from "@angular/common/http";
import { Component, ElementRef, inject, OnInit, viewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { EvaluationVersion, IntegrationLinkDetail, IntegrationLinkType } from "ng-configcat-publicapi";
import { AuthorizationComponent, DeleteSettingDialogComponent, DeleteSettingDialogData, DeleteSettingDialogResult, DeleteSettingModel, FeatureFlagItemComponent, LoaderComponent, PublicApiService, SettingItemComponent } from "ng-configcat-publicapi-ui";
import { IFrame } from "trellopowerup/lib/powerup";
import { AuthorizationParameters } from "../models/authorization-parameters";
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
  private readonly trelloService = inject(TrelloService);

  loading = true;
  showError = false;
  authorizationParameters!: AuthorizationParameters | null;
  integrationLinkDetails: IntegrationLinkDetail[] | null = null;
  EvaluationVersion = EvaluationVersion;

  trelloPowerUpIframe!: IFrame;

  readonly elementView = viewChild<ElementRef<HTMLElement>>("settingItem");

  ngOnInit(): void {
    this.trelloPowerUpIframe = this.trelloService.iframe();
    console.log("init tpifm: ");
    console.log(this.trelloPowerUpIframe);
    this.trelloService.render(() => {
      console.log("ff render");
      this.reloadSettings();
    }, this.trelloPowerUpIframe);
    this.loading = true;
    this.showError = false;
    console.log("init");
    Promise.all([
      this.trelloService.getAuthorizationParameters(this.trelloPowerUpIframe),
      this.trelloService.getCardData(this.trelloPowerUpIframe),
      this.trelloService.getCardSettingData(this.trelloPowerUpIframe),
    ]).then(value => {
      this.authorizationParameters = value[0];
      const card = value[1];
      const cardSettingData = value[2];
      if (cardSettingData !== null) {
        this.publicApiService
          .createIntegrationLinksService(this.authorizationParameters.basicAuthUsername, this.authorizationParameters.basicAuthPassword)
          .getIntegrationLinkDetails(IntegrationLinkType.Trello, card.id)
          .subscribe((integrationLinkDetails) => {
            this.integrationLinkDetails = integrationLinkDetails.details;
            this.loading = false;
            this.resize();
          });
      }
    })
      .then(() => {
        this.loading = false;
        this.resize();
      })
      .catch((error: unknown) => {
        if (error instanceof HttpErrorResponse && error?.status === 401) {
          this.authorizationParameters = null;
          void this.trelloService.removeAuthorizationParameters();
          void this.trelloService.showHttpUnauthorizedAlert();
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
    this.trelloService.render(() => {
      console.log("ff render");
      this.reloadSettings();
    }, this.trelloPowerUpIframe);
    void this.trelloService.getCardSettingData(this.trelloPowerUpIframe).then(cardSettingData => {
      console.log("reloadSettings skp?: " + cardSettingData?.skipRenderer);
      if (cardSettingData?.skipRenderer) {
        console.log("skip");
        return;
      }
      this.loading = true;
      this.showError = false;
      Promise.all([
        this.trelloService.getAuthorizationParameters(this.trelloPowerUpIframe),
        this.trelloService.getCardData(this.trelloPowerUpIframe),
      ]).then(value => {
        this.authorizationParameters = value[0];
        const card = value[1];

        this.publicApiService
          .createIntegrationLinksService(this.authorizationParameters.basicAuthUsername, this.authorizationParameters.basicAuthPassword)
          .getIntegrationLinkDetails(IntegrationLinkType.Trello, card.id)
          .subscribe((integrationLinkDetails) => {
            this.integrationLinkDetails = integrationLinkDetails.details;
            this.loading = false;
            this.resize();
          });
      })
        .catch((error: unknown) => {
          if (error instanceof HttpErrorResponse && error?.status === 401) {
            this.authorizationParameters = null;
            void this.trelloService.removeAuthorizationParameters();
            void this.trelloService.showHttpUnauthorizedAlert();
          } else {
            this.showError = true;
          }
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
    console.log("save success");
    void this.trelloService.setCardSettingData(this.trelloPowerUpIframe.getContext().card, { lastUpdatedAt: new Date(), skipRenderer: true });
  }

  saveFailed() {
    this.reloadSettings();
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
    this.trelloService
      .setAuthorizationParameters(authorizationParameters)
      .then(() => {
        console.log("login");
        this.reloadSettings();
      }).catch(() => {
        console.log("trelloService setAuthorizationParameters failed.");
      });
  }

  error() {
    this.resize();
  }

}
