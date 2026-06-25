import { inject, Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { CallbackHandler, IFrame } from "trellopowerup/lib/powerup";
import { AuthorizationParameters } from "../models/authorization-parameters";
import { TrelloService } from "./trello-service";

export type AuthParameters = AuthorizationParameters;
type TrelloFrame = CallbackHandler | IFrame | null;

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly trelloService = inject(TrelloService);

  authParametersSource: Subject<AuthParameters | null> = new Subject<AuthParameters | null>();

  getAuthorizationParmeters(t: TrelloFrame = null): Promise<AuthParameters> {
    return this.trelloService.getAuthorizationParameters(t);
  }

  setAuthorizationParameters(authorizationParameters: AuthParameters, setCardSettingData = true, t: TrelloFrame = null): Promise<void> {
    return this.trelloService.setAuthorizationParameters(authorizationParameters, setCardSettingData, t)
      .then(() => {
        this.authParametersSource.next(authorizationParameters);
      });
  }

  removeAuthorizationParameters(t: TrelloFrame = null): Promise<void> {
    return this.trelloService.removeAuthorizationParameters(t)
      .then(() => {
        this.authParametersSource.next(null);
      });
  }
}