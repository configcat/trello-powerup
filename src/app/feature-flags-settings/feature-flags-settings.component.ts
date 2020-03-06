import { Component, OnInit } from '@angular/core';

declare var TrelloPowerUp: any;

@Component({
  selector: 'app-feature-flags-settings',
  templateUrl: './feature-flags-settings.component.html',
  styleUrls: ['./feature-flags-settings.component.scss']
})
export class FeatureFlagsSettingsComponent implements OnInit {

  basicAuthUsername: string;
  basicAuthPassword: string;
  settings: any;
  readonly = false;

  constructor() { }

  ngOnInit(): void {
    Promise.all([
      TrelloPowerUp.iframe().get('organization', 'shared', 'configCatBasicAuthUserName'),
      TrelloPowerUp.iframe().get('organization', 'shared', 'configCatBasicAuthPassword'),
      TrelloPowerUp.iframe().get('card', 'shared', 'settings')
    ]).then(value => {
      this.basicAuthUsername = value[0];
      this.basicAuthPassword = value[1];
      this.settings = value[2];
    });
  }

}
