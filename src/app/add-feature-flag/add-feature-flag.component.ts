import { Component } from "@angular/core";
import { AuthorizationComponent, LinkFeatureFlagComponent } from "ng-configcat-publicapi-ui";
import { BaseLinkFeatureFlagComponent } from "../base-link-feature-flag.component";

@Component({
  selector: "configcat-trello-add-feature-flag",
  templateUrl: "./add-feature-flag.component.html",
  styleUrls: ["./add-feature-flag.component.scss"],
  imports: [
    AuthorizationComponent,
    LinkFeatureFlagComponent,
  ],
})
export class AddFeatureFlagComponent extends BaseLinkFeatureFlagComponent {

  errorText: string | null = null;

  selectDropdownPanelChanged() {
    this.resize();
  }
}
