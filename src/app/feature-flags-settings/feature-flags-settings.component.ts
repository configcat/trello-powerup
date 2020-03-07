import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DeleteSettingDialogComponent } from '../delete-setting-dialog/delete-setting-dialog.component';
import { PublicApiService } from 'ng-configcat-publicapi-ui';
import { AuthorizationParameters } from '../models/authorization-parameters';
import { TrelloService } from '../services/trello-service';

@Component({
  selector: 'app-feature-flags-settings',
  templateUrl: './feature-flags-settings.component.html',
  styleUrls: ['./feature-flags-settings.component.scss']
})
export class FeatureFlagsSettingsComponent implements OnInit {

  authorizationParameters: AuthorizationParameters;
  settings: any;
  readonly = false;

  constructor(
    private dialog: MatDialog,
    private publicApiService: PublicApiService,
    private trelloService: TrelloService
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
    /*
        dialogRef.afterClosed()
          .subscribe(result => {
            if (result === 'yes') {
              this.publicApiService.createSettingsService().deleteSetting(setting.setting.settingId).subscribe(() => {
                this.configFileForm.reset();
                this.accountInfoService.reloadAccountInfo();
                this.router.navigate(['/']);
              }, () => {
                this.snackBar.open('Ooops. Deleting setting failed. Please try again or contact us.',
                  'Dismiss', { duration: 60000, panelClass: 'red-snackbar' });
              });
            }
          });*/
  }
}
