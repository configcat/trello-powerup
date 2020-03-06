import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IEnvironment, ISetting, IProduct, IConfig } from '../models/configcat';

declare var TrelloPowerUp: any;

@Component({
  selector: 'app-add-feature-flag',
  templateUrl: './add-feature-flag.component.html',
  styleUrls: ['./add-feature-flag.component.scss']
})
export class AddFeatureFlagComponent implements OnInit {

  formGroup: FormGroup;
  basicAuthUsername: string;
  basicAuthPassword: string;

  constructor(
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      productId: [null, [Validators.required]],
      configId: [null, [Validators.required]],
      environmentId: [null, [Validators.required]],
      settingId: [null, [Validators.required]]
    });

    Promise.all([
      TrelloPowerUp.iframe().get('organization', 'shared', 'configCatBasicAuthUserName'),
      TrelloPowerUp.iframe().get('organization', 'shared', 'configCatBasicAuthPassword')
    ]).then(value => {
      this.basicAuthUsername = value[0];
      this.basicAuthPassword = value[1];
    });
  }

  add() {
    TrelloPowerUp.iframe().get('card', 'shared', 'settings').
      then(settings => {
        settings = settings || [];
        if (settings.some(s => s.environmentId === this.formGroup.value.environmentId && s.settingId === this.formGroup.value.settingId)) {
          return TrelloPowerUp.iframe().closePopup();
        } else {
          settings.push({
            environmentId: this.formGroup.value.environmentId,
            settingId: this.formGroup.value.settingId
          });

          return TrelloPowerUp.iframe().set('card', 'shared', 'settings', settings);
        }
      });
  }

}
