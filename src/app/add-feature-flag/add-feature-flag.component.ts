import { Component, DOCUMENT, inject, OnDestroy, OnInit } from "@angular/core";
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { IntegrationLinkType } from "ng-configcat-publicapi";
import { NgConfigCatPublicApiUIModule, PublicApiService } from "ng-configcat-publicapi-ui";
import { Subscription } from "rxjs";
import { AuthorizationParameters } from "../models/authorization-parameters";
import { TrelloService } from "../services/trello-service";

@Component({
  selector: "app-add-feature-flag",
  templateUrl: "./add-feature-flag.component.html",
  styleUrls: ["./add-feature-flag.component.scss"],
  imports: [NgConfigCatPublicApiUIModule, FormsModule, ReactiveFormsModule, MatButton],
})
export class AddFeatureFlagComponent implements OnInit, OnDestroy {
  private readonly formBuilder = inject(UntypedFormBuilder);
  private readonly trelloService = inject(TrelloService);
  private readonly publicApiService = inject(PublicApiService);
  private readonly document = inject<Document>(DOCUMENT);

  formGroup: UntypedFormGroup;
  authorizationParameters: AuthorizationParameters;
  subscription: Subscription;

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      productId: [null, [Validators.required]],
      configId: [null, [Validators.required]],
      environmentId: [null, [Validators.required]],
      settingId: [null, [Validators.required]],
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
      this.resize(".cdk-overlay-container");
    }

  }

  resize(selector?: string) {
    setTimeout(() => {
      if (selector === ".cdk-overlay-container") {
        //element height calculation based on trello sizeTo method + 15 px
        const el = this.document.querySelector(selector);
        const requestedHeight = Math.ceil(Math.max(el.scrollHeight, el.getBoundingClientRect().height));
        this.trelloService.sizeTo(requestedHeight + 15);
      } else {
        this.trelloService.sizeTo("#outer");
      }
    }, 200);
  }
}
