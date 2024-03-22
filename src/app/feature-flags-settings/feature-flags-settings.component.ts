import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DeleteSettingDialogComponent, PublicApiService } from 'ng-configcat-publicapi-ui';
import { AuthorizationParameters } from '../models/authorization-parameters';
import { TrelloService } from '../services/trello-service';
import { EvaluationVersion, IntegrationLinkDetail, IntegrationLinkType } from 'ng-configcat-publicapi';

@Component({
  selector: 'app-feature-flags-settings',
  templateUrl: './feature-flags-settings.component.html',
  styleUrls: ['./feature-flags-settings.component.scss']
})
export class FeatureFlagsSettingsComponent implements OnInit {

  loading = true;
  showError = false;
  authorizationParameters: AuthorizationParameters;
  integrationLinkDetails: IntegrationLinkDetail[];
  EvaluationVersion = EvaluationVersion;

  trelloPowerUpIframe: any;

  @ViewChild('settingItem') elementView: ElementRef;

  constructor(
    private dialog: MatDialog,
    private publicApiService: PublicApiService,
    private trelloService: TrelloService
  ) {
  }

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
      this.trelloService.getCardSettingData(this.trelloPowerUpIframe)
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
        ticketType: "card"
      }
    });

    dialogRef.afterClosed()
      .subscribe(result => {
        if (!result) {
          return;
        }
        if (result.button === 'remove') {
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
      const contentHeight = this.elementView?.nativeElement?.offsetHeight;
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
