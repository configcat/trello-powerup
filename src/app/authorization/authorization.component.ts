import { Component, OnInit, inject } from '@angular/core';
import { TrelloService } from '../services/trello-service';
import { NgConfigCatPublicApiUIModule } from 'ng-configcat-publicapi-ui';

@Component({
    selector: 'app-authorization',
    templateUrl: './authorization.component.html',
    styleUrls: ['./authorization.component.scss'],
    imports: [NgConfigCatPublicApiUIModule]
})
export class AuthorizationComponent implements OnInit {
  private trelloService = inject(TrelloService);


  ngOnInit(): void {
    this.resize();
  }

  login(authorizationParameters) {
    this.trelloService
      .setAuthorizationParameters(authorizationParameters)
      .then(() => {
        this.trelloService.closePopup();
      });
  }

  error() {
    this.resize();
  }

  resize() {
    setTimeout(() => {
      this.trelloService.sizeTo('#auth');
    }, 300);
  }
}
