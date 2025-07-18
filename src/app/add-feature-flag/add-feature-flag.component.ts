import { Component, DOCUMENT, inject, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { IntegrationLinkType } from "ng-configcat-publicapi";
import { AuthorizationModel, NgConfigCatPublicApiUIModule, PublicApiService } from "ng-configcat-publicapi-ui";
import { Subscription } from "rxjs";
import { AuthorizationParameters } from "../models/authorization-parameters";
import { TrelloService } from "../services/trello-service";

@Component({
  selector: "configcat-trello-add-feature-flag",
  templateUrl: "./add-feature-flag.component.html",
  styleUrls: ["./add-feature-flag.component.scss"],
  imports: [NgConfigCatPublicApiUIModule, FormsModule, ReactiveFormsModule, MatButton],
})
export class AddFeatureFlagComponent implements OnInit, OnDestroy {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly trelloService = inject(TrelloService);
  private readonly publicApiService = inject(PublicApiService);
  private readonly document = inject<Document>(DOCUMENT);

  authorizationParameters!: AuthorizationParameters;
  subscription!: Subscription | null;

  formGroup = this.formBuilder.group({
    productId: new FormControl<string>("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    environmentId: new FormControl<string>("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    configId: new FormControl<string>("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    settingId: new FormControl<number>(0, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  ngOnInit(): void {
    this.subscription = this.formGroup.statusChanges.subscribe(() => {
      this.resize();
    });

    void this.init();
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

  login(authorizationModel: AuthorizationModel) {
    this.trelloService
      .setAuthorizationParameters({ basicAuthUsername: authorizationModel.basicAuthUsername, basicAuthPassword: authorizationModel.basicAuthPassword })
      .then(() => {
        this.init().catch(() => {
          console.log("AddFeatureFlagComponent init failed.");
        });
      })
      .catch(() => {
        console.log("trelloService setAuthorizationParameters failed.");
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
        .addOrUpdateIntegrationLink(this.formGroup.controls.environmentId.value, this.formGroup.controls.settingId.value,
          IntegrationLinkType.Trello, card.id,
          { description: card.name, url: card.url })
    )
      .then(() => {
        return this.trelloService.setCardSettingData({ lastUpdatedAt: new Date() });
      })
      .then(() => {
        return this.trelloService.closePopup();
      })
      .catch((error: unknown) => {
        console.log(error);
      });
  }

  selectDropdownPanelChanged(event: boolean) {
    if (!event) {
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
        if (el) {
          const requestedHeight = Math.ceil(Math.max(el.scrollHeight, el.getBoundingClientRect().height));
          void this.trelloService.sizeToHeight(requestedHeight + 15);
        }
      } else {
        void this.trelloService.sizeTo("#outer");
      }
    }, 200);
  }
}
