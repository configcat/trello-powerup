import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DeleteSettingDialogComponent } from '../delete-setting-dialog/delete-setting-dialog.component';
import { PublicApiService } from 'ng-configcat-publicapi-ui';
import { AuthorizationParameters } from '../models/authorization-parameters';
import { TrelloService } from '../services/trello-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IntegrationLinkDetail, IntegrationLinkType } from 'ng-configcat-publicapi';

@Component({
  selector: 'app-feature-flags-settings',
  templateUrl: './feature-flags-settings.component.html',
  styleUrls: ['./feature-flags-settings.component.scss']
})
export class FeatureFlagsSettingsComponent implements OnInit {

  authorizationParameters: AuthorizationParameters;
  integrationLinkDetails: IntegrationLinkDetail[];
  showVariationId = false;

  constructor(
    private dialog: MatDialog,
    private publicApiService: PublicApiService,
    private trelloService: TrelloService
  ) { 
    console.log('FeatureFlagsSettingsComponent - constructor');
  }

  ngOnInit(): void {
    console.log('FeatureFlagsSettingsComponent - init');
    this.trelloService.render(() => this.reloadSettings());
  }

  reloadSettings() {
    console.log('FeatureFlagsSettingsComponent - reloadSettings');
    return Promise.all([
      this.trelloService.getAuthorizationParameters(),
      this.trelloService.getCardData()
    ]).then(value => {
      this.authorizationParameters = value[0];
      const card = value[1];
      console.log('FeatureFlagsSettingsComponent - promise.all\n' + JSON.stringify(this.authorizationParameters));
      return this.publicApiService
        .createIntegrationLinksService(this.authorizationParameters.basicAuthUsername, this.authorizationParameters.basicAuthPassword)
        .getIntegrationLinkDetails(IntegrationLinkType.Trello, card.id)
        .toPromise()
        .then((integrationLinkDetails) => {
          console.log('FeatureFlagsSettingsComponent - getIntegrationLinks');
          this.integrationLinkDetails = integrationLinkDetails.details;
          console.log(this.integrationLinkDetails);
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
    const dialogRef = this.dialog.open(DeleteSettingDialogComponent);

    dialogRef.afterClosed()
      .subscribe(result => {
        if (!result) {
          return;
        }
        if (result.button === 'removeFromCard') {
          this.trelloService.removeSetting(data.environment.environmentId, data.setting.settingId);
        }
      });
  }

  loadSucceeded() {
    this.resize();
  }

  saveSucceeded() {
    this.trelloService.setCardSettingData({ lastUpdatedAt: new Date() });
    this.resize();
  }

  onFormValuesChanged() {
    this.resize();
  }

  resize() {
    setTimeout(() => {
      this.trelloService.sizeTo('#setting-item');
    }, 300);
  }
}
