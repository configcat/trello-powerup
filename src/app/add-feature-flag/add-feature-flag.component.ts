import { Component, OnInit, OnDestroy, inject, DOCUMENT } from '@angular/core';

import { UntypedFormGroup, UntypedFormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TrelloService } from '../services/trello-service';
import { AuthorizationParameters } from '../models/authorization-parameters';
import { Subscription } from 'rxjs';
import { PublicApiService, NgConfigCatPublicApiUIModule } from 'ng-configcat-publicapi-ui';
import { IntegrationLinkType } from 'ng-configcat-publicapi';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-add-feature-flag',
    templateUrl: './add-feature-flag.component.html',
    styleUrls: ['./add-feature-flag.component.scss'],
    imports: [NgConfigCatPublicApiUIModule, FormsModule, ReactiveFormsModule, MatButton]
})
export class AddFeatureFlagComponent implements OnInit, OnDestroy {
  private formBuilder = inject(UntypedFormBuilder);
  private trelloService = inject(TrelloService);
  private publicApiService = inject(PublicApiService);
  private document = inject<Document>(DOCUMENT);


  formGroup: UntypedFormGroup;
  authorizationParameters: AuthorizationParameters;
  subscription: Subscription;

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      productId: [null, [Validators.required]],
      configId: [null, [Validators.required]],
      environmentId: [null, [Validators.required]],
      settingId: [null, [Validators.required]]
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

    this.trelloService.getCardData().then(
      card => this.publicApiService
        .createIntegrationLinksService(this.authorizationParameters.basicAuthUsername, this.authorizationParameters.basicAuthPassword)
        .addOrUpdateIntegrationLink(this.formGroup.value.environmentId, this.formGroup.value.settingId,
          IntegrationLinkType.Trello, card.id,
          { description: card.name, url: card.url })
        .toPromise()
    )
      .then(() => {
        return this.trelloService.setCardSettingData({ lastUpdatedAt: new Date() });
      })
      .then(() => {
        return this.trelloService.closePopup();
      })
      .catch(error => {
        console.log(error);
      });
  }

  selectDropdownPanelChanged(event: any) {
    if (event === false) {
      this.resize();
    } else {
      this.resize('.cdk-overlay-container');
    }

  }

  resize(selector?: string) {
    setTimeout(() => {
      if (selector === '.cdk-overlay-container') {
        //element height calculation based on trello sizeTo method + 15 px
        const el = this.document.querySelector(selector);
        let requestedHeight = Math.ceil(Math.max(el.scrollHeight, el.getBoundingClientRect().height));
        this.trelloService.sizeTo(requestedHeight + 15);
      } else {
        this.trelloService.sizeTo('#outer');
      }
    }, 200);
  }
}
