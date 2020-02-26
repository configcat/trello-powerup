import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IEnvironment, ISetting, IProduct, IConfig } from '../models/configcat';
import { ConfigcatPublicApiService } from '../services/configcat-public-api.service';
import { of } from 'rxjs';

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
        this.formGroup.value.productId = this.products[0].productId;
      }
    });
  }

  async onProductChanged() {
    if (!this.formGroup.value || !this.formGroup.value.productId) {
      this.configs = [];
      this.environments = [];
    }

    const configs = await this.configcatPublicApiService.getConfigs(this.formGroup.value.productId);
    this.configs = configs;
    const environments = await this.configcatPublicApiService.getEnvironments(this.formGroup.value.productId);
    this.environments = environments;
  }

  async onConfigChanged() {
    if (!this.formGroup.value || !this.formGroup.value.configId) {
      this.settings = [];
    }

    const settings = await this.configcatPublicApiService.getSettings(this.formGroup.value.configId);
    this.settings = settings;
  }

  onSubmit() {

  }

}
