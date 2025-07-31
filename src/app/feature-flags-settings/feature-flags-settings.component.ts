import { HttpErrorResponse } from "@angular/common/http";
import { Component, ElementRef, inject, OnInit, viewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { EvaluationVersion, IntegrationLinkDetail, IntegrationLinkType } from "ng-configcat-publicapi";
import { AuthorizationComponent, DeleteSettingDialogComponent, DeleteSettingDialogData, DeleteSettingDialogResult, DeleteSettingModel, FeatureFlagItemComponent, PublicApiService, SettingItemComponent } from "ng-configcat-publicapi-ui";
import { LoaderComponent } from "../loader/loader.component";
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
  integrationLinkDetails!: IntegrationLinkDetail[] | null;
  EvaluationVersion = EvaluationVersion;

  readonly elementView = viewChild<ElementRef<HTMLElement>>("settingItem");

  ngOnInit(): void {
    const trelloPowerUpIframe = this.trelloService.iframe();
    this.trelloService.render(() => this.reloadSettings(), trelloPowerUpIframe);
  }

  reloadSettings() {
    this.loading = true;
    this.showError = false;
    Promise.all([
      this.trelloService.getAuthorizationParameters(),
      this.trelloService.getCardData(),
      this.trelloService.getCardSettingData(),
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
        void this.trelloService.removeSetting(data.environment.environmentId, data.setting.settingId);
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
    void this.trelloService.setCardSettingData({ lastUpdatedAt: new Date() });
  }

  onFormValuesChanged() {
    this.resize();
  }

  resize() {
    setTimeout(() => {
      const contentHeight = this.elementView()?.nativeElement?.offsetHeight;
      const height = contentHeight && contentHeight < 700 ? contentHeight : 700;
      void this.trelloService.sizeToHeight(height, this.trelloService.iframe());
    }, 300);
  }

  login(authorizationParameters: AuthorizationParameters) {
    this.trelloService
      .setAuthorizationParameters(authorizationParameters)
      .then(() => {
        this.reloadSettings();
      }).catch(() => {
        console.log("trelloService setAuthorizationParameters failed.");
      });
  }

  error() {
    this.resize();
  }

}
