import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { MatError, MatFormField, MatHint, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { MatOption, MatSelect } from "@angular/material/select";
import { IntegrationLinkType, SettingType } from "ng-configcat-publicapi";
import { AuthorizationComponent, AuthorizationModel, ConfigSelectComponent, EnvironmentSelectComponent, ProductSelectComponent, PublicApiService } from "ng-configcat-publicapi-ui";
import { Subscription } from "rxjs";
import { AuthorizationParameters } from "../models/authorization-parameters";
import { ErrorHandler } from "../services/error-handler";
import { TrelloService } from "../services/trello-service";

@Component({
  selector: "configcat-trello-create-feature-flag",
  templateUrl: "./create-feature-flag.component.html",
  styleUrls: ["./create-feature-flag.component.scss"],
  imports: [
    ProductSelectComponent, ConfigSelectComponent, EnvironmentSelectComponent, AuthorizationComponent,
    FormsModule, ReactiveFormsModule, MatFormField,
    MatLabel, MatSelect, MatOption, MatInput, MatHint, MatError, MatButton],
})
export class CreateFeatureFlagComponent implements OnInit, OnDestroy {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly trelloService = inject(TrelloService);
  private readonly publicApiService = inject(PublicApiService);

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
    name: new FormControl<string>("", {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(255)],
    }),
    key: new FormControl<string>("", {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(255)],
    }),
    hint: new FormControl<string>("", {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(255)],
    }),
    settingType: new FormControl<SettingType>(SettingType.Boolean, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  authorizationParameters!: AuthorizationParameters;
  subscription!: Subscription | null;
  SettingTypeEnum = SettingType;
  ErrorHandler = ErrorHandler;

  ngOnInit(): void {
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

  init() {
    this.trelloService.getAuthorizationParameters().then(value => { this.authorizationParameters = value; }).catch(() => {
      console.log("trelloService getAuthorizationParameters failed.");
    });
    this.resize();
  }

  login(authorizationModel: AuthorizationModel) {
    this.trelloService
      .setAuthorizationParameters({ basicAuthUsername: authorizationModel.basicAuthUsername, basicAuthPassword: authorizationModel.basicAuthPassword })
      .then(() => {
        this.init();
      }).catch(() => {
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

    this.trelloService.getCardData()
      .then(
        card => {
          return this.publicApiService
            .createSettingsService(this.authorizationParameters.basicAuthUsername, this.authorizationParameters.basicAuthPassword)
            .createSetting(this.formGroup.controls.configId.value, {
              key: this.formGroup.controls.key.value,
              settingType: this.formGroup.controls.settingType.value,
              name: this.formGroup.controls.name.value,
              hint: this.formGroup.controls.hint.value,
            })
            .subscribe(setting => {
              return this.publicApiService
                .createIntegrationLinksService(this.authorizationParameters.basicAuthUsername, this.authorizationParameters.basicAuthPassword)
                .addOrUpdateIntegrationLink(this.formGroup.controls.environmentId.value, setting.settingId,
                  IntegrationLinkType.Trello, card.id,
                  { description: card.name, url: card.url });
            });
        }
      )
      .then(() => {
        return this.trelloService.setCardSettingData({ lastUpdatedAt: new Date() });
      })
      .then(() => {
        return this.trelloService.closePopup();
      })
      .catch((error: unknown) => {
        //not sure this works
        ErrorHandler.handleErrors(this.formGroup, error as Error);
        console.log(error);
      });
  }

  resize() {
    setTimeout(() => {
      this.trelloService.sizeTo("#outer").catch(() => {
        console.log("trelloService sizeTo failed.");
      });
    }, 300);
  }
}
