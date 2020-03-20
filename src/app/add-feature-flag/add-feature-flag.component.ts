import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TrelloService } from '../services/trello-service';
import { AuthorizationParameters } from '../models/authorization-parameters';
import { Subscription } from 'rxjs';

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
    private trelloService: TrelloService) { }

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

    this.trelloService.setSetting({
      environmentId: this.formGroup.value.environmentId,
      settingId: this.formGroup.value.settingId,
      configId: this.formGroup.value.configId,
      productId: this.formGroup.value.productId,
      lastUpdatedAt: new Date()
    }).then(() => {
      return this.trelloService.closePopup();
    });
  }

  resize() {
    setTimeout(() => {
      this.trelloService.sizeTo('#outer');
    }, 300);
  }
}
