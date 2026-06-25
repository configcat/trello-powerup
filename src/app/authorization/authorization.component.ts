import { Component, inject, OnInit } from "@angular/core";
import { AuthorizationComponent, AuthorizationModel } from "ng-configcat-publicapi-ui";
import { AuthService } from "../services/auth.service";
import { TrelloService } from "../services/trello-service";

@Component({
  selector: "configcat-trello-authorization",
  templateUrl: "./authorization.component.html",
  styleUrls: ["./authorization.component.scss"],
  imports: [AuthorizationComponent],
})
export class AuthComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly trelloService = inject(TrelloService);

  ngOnInit(): void {
    this.resize();
  }

  login(authorizationModel: AuthorizationModel) {
    this.authService
      .setAuthorizationParameters({ basicAuthUsername: authorizationModel.basicAuthUsername, basicAuthPassword: authorizationModel.basicAuthPassword }, false)
      .then(() => {
        this.trelloService.closePopup().catch(() => {
          console.log("trelloService closePopup failed.");
        });
        return this.trelloService.closeModal();
      }).catch((error: unknown) => {
        console.log("authService setAuthorizationParameters failed.", error);
      });
  }

  error() {
    this.resize();
  }

  resize() {
    setTimeout(() => {
      void this.trelloService.sizeTo("#auth");
    }, 300);
  }
}
