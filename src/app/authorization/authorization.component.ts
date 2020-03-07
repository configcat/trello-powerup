import { Component, OnInit } from '@angular/core';
import { TrelloService } from '../services/trello-service';

@Component({
  selector: 'app-authorization',
  templateUrl: './authorization.component.html',
  styleUrls: ['./authorization.component.scss']
})
export class AuthorizationComponent implements OnInit {

  constructor(private trelloService: TrelloService) { }

  ngOnInit(): void {
  }

  login(authorizationParameters) {
    this.trelloService
      .setAuthorizationParameters(authorizationParameters)
      .then(() => {
        this.trelloService.closePopup();
      });
  }
}
