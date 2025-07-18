import { HttpErrorResponse } from "@angular/common/http";
import { Component, ElementRef, inject, OnInit, viewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { EvaluationVersion, IntegrationLinkDetail, IntegrationLinkType } from "ng-configcat-publicapi";
import { DeleteSettingDialogComponent, DeleteSettingDialogData, DeleteSettingDialogResult, DeleteSettingModel, NgConfigCatPublicApiUIModule, PublicApiService } from "ng-configcat-publicapi-ui";
import { CallbackHandler } from "trellopowerup/lib/powerup";
import { LoaderComponent } from "../loader/loader.component";
import { AuthorizationParameters } from "../models/authorization-parameters";
import { TrelloService } from "../services/trello-service";

@Component({
  selector: "configcat-trello-feature-flags-settings",
  templateUrl: "./feature-flags-settings.component.html",
  styleUrls: ["./feature-flags-settings.component.scss"],
  imports: [NgConfigCatPublicApiUIModule, LoaderComponent],
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

  trelloCallbackHandler!: CallbackHandler;

  readonly elementView = viewChild<ElementRef<HTMLElement>>("settingItem");

  ngOnInit(): void {
    this.trelloCallbackHandler = this.trelloService.callbackHandler();
    const trelloPowerUpIframe = this.trelloService.iframe();
    this.trelloService.render(() => this.reloadSettings(), trelloPowerUpIframe);
  }

  reloadSettings() {
    this.loading = true;
    this.showError = false;
    return Promise.all([
      this.trelloService.getAuthorizationParameters(this.trelloCallbackHandler),
      this.trelloService.getCardData(this.trelloCallbackHandler),
      this.trelloService.getCardSettingData(this.trelloCallbackHandler),
    ]).then(value => {
      this.authorizationParameters = value[0];
      const card = value[1];
      return this.publicApiService
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
    void this.trelloService.setCardSettingData({ lastUpdatedAt: new Date() }, this.trelloCallbackHandler);
  }

  onFormValuesChanged() {
    this.resize();
  }

  resize() {
    setTimeout(() => {
      const contentHeight = this.elementView()?.nativeElement?.offsetHeight;
      const height = contentHeight && contentHeight < 700 ? contentHeight : 700;
      void this.trelloService.sizeToHeight(height, this.trelloCallbackHandler);
    }, 300);
  }

  login(authorizationParameters: AuthorizationParameters) {
    this.trelloService
      .setAuthorizationParameters(authorizationParameters)
      .then(() => {
        this.reloadSettings().catch(() => {
          console.log("reloadSettings failed.");
        });
      }).catch(() => {
        console.log("trelloService setAuthorizationParameters failed.");
      });
  }

  error() {
    this.resize();
  }

}
