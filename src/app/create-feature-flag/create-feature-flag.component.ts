import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { IntegrationLinkType, SettingType } from 'ng-configcat-publicapi';
import { PublicApiService } from 'ng-configcat-publicapi-ui';
import { Subscription } from 'rxjs';
import { AuthorizationParameters } from '../models/authorization-parameters';
import { ErrorHandler } from '../services/error-handler';
import { TrelloService } from '../services/trello-service';

@Component({
  selector: 'app-create-feature-flag',
  templateUrl: './create-feature-flag.component.html',
  styleUrls: ['./create-feature-flag.component.scss']
})
export class CreateFeatureFlagComponent implements OnInit, OnDestroy {

  formGroup: UntypedFormGroup;
  authorizationParameters: AuthorizationParameters;
  subscription: Subscription;
  SettingTypeEnum = SettingType;
  ErrorHandler = ErrorHandler;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private trelloService: TrelloService,
    private publicApiService: PublicApiService) { }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      productId: [null, [Validators.required]],
      configId: [null, [Validators.required]],
      environmentId: [null, [Validators.required]],
      name: ['', [Validators.required, Validators.maxLength(255)]],
      key: ['', [Validators.required, Validators.maxLength(255)]],
      hint: ['', [Validators.maxLength(1000)]],
      settingType: [SettingType.Boolean, [Validators.required]],
    });

    this.subscription = this.formGroup.statusChanges.subscribe(() => {
      this.resize();
    });

    this.init();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  async init() {
    this.authorizationParameters = await this.trelloService.getAuthorizationParameters();
    this.resize();
  }

  login(authorizationParameters) {
    this.trelloService
      .setAuthorizationParameters(authorizationParameters)
      .then(() => {
        this.init();
      });
  }

  error() {
    this.resize();
  }

  add() {
    if (!this.formGroup.valid) {
      return;
    }

    this.trelloService.getCardData()
      .then(
        card => {
          return this.publicApiService
            .createSettingsService(this.authorizationParameters.basicAuthUsername, this.authorizationParameters.basicAuthPassword)
            .createSetting(this.formGroup.value.configId, {
              key: this.formGroup.value.key,
              settingType: this.formGroup.value.settingType,
              name: this.formGroup.value.name,
              hint: this.formGroup.value.hint
            })
            .toPromise()
            .then(setting => {
              return this.publicApiService
                .createIntegrationLinksService(this.authorizationParameters.basicAuthUsername, this.authorizationParameters.basicAuthPassword)
                .addOrUpdateIntegrationLink(this.formGroup.value.environmentId, setting.settingId,
                  IntegrationLinkType.Trello, card.id,
                  { description: card.name, url: card.url })
                .toPromise();
            });
        }
      )
      .then(() => {
        return this.trelloService.setCardSettingData({ lastUpdatedAt: new Date() });
      })
      .then(() => {
        return this.trelloService.closePopup();
      })
      .catch(error => {
        ErrorHandler.handleErrors(this.formGroup, error);
        console.log(error);
      });
  }

  resize() {
    setTimeout(() => {
      this.trelloService.sizeTo('#outer');
    }, 300);
  }
}
