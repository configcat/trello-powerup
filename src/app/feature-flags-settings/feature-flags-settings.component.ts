import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { DeleteSettingDialogComponent, PublicApiService } from 'ng-configcat-publicapi-ui';
import { AuthorizationParameters } from '../models/authorization-parameters';
import { TrelloService } from '../services/trello-service';
import { IntegrationLinkDetail, IntegrationLinkType } from 'ng-configcat-publicapi';

@Component({
  selector: 'app-feature-flags-settings',
  templateUrl: './feature-flags-settings.component.html',
  styleUrls: ['./feature-flags-settings.component.scss']
})
export class FeatureFlagsSettingsComponent implements OnInit {

  loading = true;
  authorizationParameters: AuthorizationParameters;
  integrationLinkDetails: IntegrationLinkDetail[];

  trelloPowerUpIframe: any;

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
        console.log(error);
      });
  }

  onEditSettingRequested(setting) {
    /*
    Available properties:
    setting.setting.settingId
    setting.setting.name
    setting.setting.key
    setting.config.configId
    setting.config.name
    setting.environment.environmentId
    setting.environment.name
    */
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

  saveSucceeded() {
    this.trelloService.setCardSettingData({ lastUpdatedAt: new Date() }, this.trelloPowerUpIframe);
    this.resize();
  }

  onFormValuesChanged() {
    this.resize();
  }

  resize() {
    setTimeout(() => {
      this.trelloService.sizeTo('#setting-item', this.trelloPowerUpIframe);
    }, 300);
  }
}
