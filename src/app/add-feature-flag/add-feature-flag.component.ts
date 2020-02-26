import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IEnvironment, ISetting, IProduct, IConfig } from '../models/configcat';
import { ConfigcatPublicApiService } from '../services/configcat-public-api.service';

declare var TrelloPowerUp: any;

@Component({
  selector: 'app-add-feature-flag',
  templateUrl: './add-feature-flag.component.html',
  styleUrls: ['./add-feature-flag.component.scss']
})
export class AddFeatureFlagComponent implements OnInit {

  products: IProduct[];
  configs: IConfig[];
  environments: IEnvironment[];
  settings: ISetting[];

  formGroup: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private configcatPublicApiService: ConfigcatPublicApiService) { }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      productId: [null, [Validators.required]],
      configId: [null, [Validators.required]],
      environmentId: [null, [Validators.required]],
      settingId: [null, [Validators.required]]
    });

    this.configcatPublicApiService.getProducts().then(products => {
      this.products = products;
      if (this.products && this.products.length > 0) {
        this.formGroup.patchValue({
          productId: this.products[0].productId
        });

        return this.onProductChanged();
      }
    });
  }

  onProductChanged() {
    if (!this.formGroup || !this.formGroup.value || !this.formGroup.value.productId) {
      this.configs = [];
      this.environments = [];
    }

    return this.configcatPublicApiService
      .getConfigs(this.formGroup.value.productId)
      .then(currentConfigs => {
        this.configs = currentConfigs;
        if (this.configs && this.configs.length > 0) {
          this.formGroup.patchValue({
            configId: this.configs[0].configId
          });

          return this.onConfigChanged();
        }
      })
      .then(() => {
        return this.configcatPublicApiService.getEnvironments(this.formGroup.value.productId)
          .then(currentEnvironments => {
            this.environments = currentEnvironments;
            if (this.environments && this.environments.length > 0) {
              this.formGroup.patchValue({
                environmentId: this.environments[0].environmentId
              });
            }
          });
      });
  }

  onConfigChanged() {
    if (!this.formGroup || !this.formGroup.value || !this.formGroup.value.configId) {
      this.settings = [];
    }

    return this.configcatPublicApiService
      .getSettings(this.formGroup.value.configId)
      .then(currentSettings => {
        this.settings = currentSettings;

        if (this.settings && this.settings.length > 0) {
          this.formGroup.patchValue({
            settingId: this.settings[0].settingId
          });
        }
      });
  }

  onSubmit() {
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
