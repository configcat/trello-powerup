import { Component, ElementRef, inject, OnInit, viewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { EvaluationVersion, IntegrationLinkDetail, IntegrationLinkType } from "ng-configcat-publicapi";
import { DeleteSettingDialogComponent, NgConfigCatPublicApiUIModule, PublicApiService } from "ng-configcat-publicapi-ui";
import { LoaderComponent } from "../loader/loader.component";
import { AuthorizationParameters } from "../models/authorization-parameters";
import { TrelloService } from "../services/trello-service";

@Component({
  selector: "app-feature-flags-settings",
  templateUrl: "./feature-flags-settings.component.html",
  styleUrls: ["./feature-flags-settings.component.scss"],
  imports: [LoaderComponent, NgConfigCatPublicApiUIModule],
})
export class FeatureFlagsSettingsComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly publicApiService = inject(PublicApiService);
  private readonly trelloService = inject(TrelloService);

  loading = true;
  showError = false;
  authorizationParameters: AuthorizationParameters;
  integrationLinkDetails: IntegrationLinkDetail[];
  EvaluationVersion = EvaluationVersion;

  trelloPowerUpIframe: any;

  readonly elementView = viewChild<ElementRef>("settingItem");

  ngOnInit(): void {
    this.trelloPowerUpIframe = this.trelloService.iframe();
    this.trelloService.render(() => this.reloadSettings(), this.trelloPowerUpIframe);
  }

  reloadSettings() {
    this.loading = true;
    this.showError = false;
    return Promise.all([
      this.trelloService.getAuthorizationParameters(this.trelloPowerUpIframe),
      this.trelloService.getCardData(this.trelloPowerUpIframe),
      this.trelloService.getCardSettingData(this.trelloPowerUpIframe),
    ]).then(value => {
      this.authorizationParameters = value[0];
      const card = value[1];
      return this.publicApiService
        .createIntegrationLinksService(this.authorizationParameters.basicAuthUsername, this.authorizationParameters.basicAuthPassword)
        .getIntegrationLinkDetails(IntegrationLinkType.Trello, card.id)
        .toPromise()
        .then((integrationLinkDetails) => {
          this.integrationLinkDetails = integrationLinkDetails.details;
          this.loading = false;
          this.resize();
        });
    })
      .catch(error => {
        if (error?.status === 401) {
          this.authorizationParameters = null;
          this.trelloService.removeAuthorizationParameters();
          this.trelloService.showHttpUnauthorizedAlert();
        } else {
          this.showError = true;
        }
        this.loading = false;
        this.resize();
        console.log(error);
      });
  }

  onDeleteSettingRequested(data) {
    const dialogRef = this.dialog.open(DeleteSettingDialogComponent, {
      data: {
        system: "Trello",
        ticketType: "card",
      },
    });

    dialogRef.afterClosed()
      .subscribe(result => {
        if (!result) {
          return;
        }
        if (result.button === "remove") {
          this.trelloService.removeSetting(data.environment.environmentId, data.setting.settingId);
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
    this.trelloService.setCardSettingData({ lastUpdatedAt: new Date() }, this.trelloPowerUpIframe);
  }

  onFormValuesChanged() {
    this.resize();
  }

  resize() {
    setTimeout(() => {
      const contentHeight = this.elementView()?.nativeElement?.offsetHeight;
      const height = contentHeight && contentHeight < 700 ? contentHeight : 700;
      this.trelloService.sizeToHeight(height, this.trelloPowerUpIframe);
    }, 300);
  }

  login(authorizationParameters) {
    this.trelloService
      .setAuthorizationParameters(authorizationParameters)
      .then(() => {
        this.reloadSettings();
      });
  }

  error() {
    this.resize();
  }

}
