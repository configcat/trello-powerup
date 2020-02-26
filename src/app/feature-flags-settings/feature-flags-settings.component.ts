import { Component, OnInit } from '@angular/core';

declare var TrelloPowerUp: any;

@Component({
  selector: 'app-feature-flags-settings',
  templateUrl: './feature-flags-settings.component.html',
  styleUrls: ['./feature-flags-settings.component.scss']
})
export class FeatureFlagsSettingsComponent implements OnInit {

  settings: any;

  constructor() { }

  ngOnInit(): void {
    TrelloPowerUp.iframe().get('card', 'shared', 'settings').
      then(settings => {
        this.settings = settings;
      });
  }

}
