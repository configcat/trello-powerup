import { Component, ChangeDetectionStrategy } from "@angular/core";
import { SettingType } from "ng-configcat-publicapi";
import { AuthorizationComponent, CreateFeatureFlagComponent, FormHelper } from "ng-configcat-publicapi-ui";
import { BaseLinkFeatureFlagComponent } from "../base-link-feature-flag.component";
import { ErrorHandler } from "../services/error-handler";

@Component({
  selector: "configcat-trello-create-feature-flag",
  templateUrl: "./create-feature-flag.component.html",
  styleUrls: ["./create-feature-flag.component.scss"],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AuthorizationComponent, CreateFeatureFlagComponent],
})
export class CreateLinkFeatureFlagComponent extends BaseLinkFeatureFlagComponent {
  SettingTypeEnum = SettingType;
  ErrorHandler = ErrorHandler;
  FormHelper = FormHelper;

  protected override onAddSuccess(): void {
    // No callback needed for create flow
  }

  protected override onAddError(): void {
    // No callback needed for create flow
  }
}
