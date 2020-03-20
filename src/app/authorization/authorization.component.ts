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
