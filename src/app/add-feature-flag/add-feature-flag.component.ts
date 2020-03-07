import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TrelloService } from '../services/trello-service';
import { AuthorizationParameters } from '../models/authorization-parameters';

@Component({
  selector: 'app-add-feature-flag',
  templateUrl: './add-feature-flag.component.html',
  styleUrls: ['./add-feature-flag.component.scss']
})
export class AddFeatureFlagComponent implements OnInit {

  formGroup: FormGroup;
  authorizationParameters: AuthorizationParameters;

  constructor(
    private formBuilder: FormBuilder,
    private trelloService: TrelloService) { }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      productId: [null, [Validators.required]],
      configId: [null, [Validators.required]],
      environmentId: [null, [Validators.required]],
      settingId: [null, [Validators.required]]
    });

    this.trelloService.getAuthorizationParameters().then(authorizationParameters => {
      this.authorizationParameters = authorizationParameters;
    });
  }

  add() {
    if (!this.formGroup.valid) {
      return;
    }

    this.trelloService.getSettings()
      .then(settings => {
        if (settings.some(s => s.environmentId === this.formGroup.value.environmentId && s.settingId === this.formGroup.value.settingId)) {
          return this.trelloService.closePopup();
        } else {
          settings.push({
            environmentId: this.formGroup.value.environmentId,
            settingId: this.formGroup.value.settingId
          });

          return this.trelloService.setSettings(settings);
        }
      });
  }

}
