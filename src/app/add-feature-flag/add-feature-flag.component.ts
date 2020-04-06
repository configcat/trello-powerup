import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TrelloService } from '../services/trello-service';
import { AuthorizationParameters } from '../models/authorization-parameters';
import { Subscription } from 'rxjs';
import { PublicApiService } from 'ng-configcat-publicapi-ui';
import { IntegrationLinkType } from 'ng-configcat-publicapi';

@Component({
  selector: 'app-add-feature-flag',
  templateUrl: './add-feature-flag.component.html',
  styleUrls: ['./add-feature-flag.component.scss']
})
export class AddFeatureFlagComponent implements OnInit, OnDestroy {

  formGroup: FormGroup;
  authorizationParameters: AuthorizationParameters;
  subscription: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private trelloService: TrelloService,
    private publicApiService: PublicApiService) { }

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

    this.trelloService.getAuthorizationParameters().then(authorizationParameters => {
      this.authorizationParameters = authorizationParameters;
      this.resize();
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
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
        // TODO
      });
  }

  resize() {
    setTimeout(() => {
      this.trelloService.sizeTo('#outer');
    }, 300);
  }
}
