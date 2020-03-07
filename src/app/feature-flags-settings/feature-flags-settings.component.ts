import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DeleteSettingDialogComponent } from '../delete-setting-dialog/delete-setting-dialog.component';
import { PublicApiService } from 'ng-configcat-publicapi-ui';
import { AuthorizationParameters } from '../models/authorization-parameters';
import { TrelloService } from '../services/trello-service';
import { CardSetting } from '../models/card-settings';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-feature-flags-settings',
  templateUrl: './feature-flags-settings.component.html',
  styleUrls: ['./feature-flags-settings.component.scss']
})
export class FeatureFlagsSettingsComponent implements OnInit {

  authorizationParameters: AuthorizationParameters;
  settings: CardSetting[];
  readonly = false;

  constructor(
    private dialog: MatDialog,
    private publicApiService: PublicApiService,
    private trelloService: TrelloService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    Promise.all([
      this.trelloService.getAuthorizationParameters(),
      this.trelloService.getSettings()
    ]).then(value => {
      this.authorizationParameters = value[0];
      this.settings = value[1];
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

  onDeleteSettingRequested(setting) {
    const dialogRef = this.dialog.open(DeleteSettingDialogComponent);

    dialogRef.afterClosed()
      .subscribe(result => {

        if (result === 'deletePermanently') {
          this.publicApiService.createSettingsService(
            this.authorizationParameters.basicAuthUsername,
            this.authorizationParameters.basicAuthPassword)
            .deleteSetting(setting.setting.settingId).subscribe(() => {

              this.trelloService.removeSetting({ settingId: setting.setting.settingId, environmentId: setting.environment.environmentId })
                .then(settings => {
                  this.settings = settings;
                });

            }, () => {
              this.snackBar.open('Ooops. Deleting setting failed. Please try again or contact us.',
                'Dismiss', { duration: 60000, panelClass: 'red-snackbar' });
            });
        } else if (result === 'removeFromCard') {
          this.trelloService.removeSetting({ settingId: setting.setting.settingId, environmentId: setting.environment.environmentId })
            .then(settings => {
              this.settings = settings;
            });
        }
      });
  }
}
