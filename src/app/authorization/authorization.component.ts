import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TrelloService } from '../services/trello.service';

declare var TrelloPowerUp: any;

@Component({
  selector: 'app-authorization',
  templateUrl: './authorization.component.html',
  styleUrls: ['./authorization.component.scss']
})
export class AuthorizationComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  login(authParameter) {
    debugger;
    TrelloPowerUp.iframe().set('organization', 'shared', {
      configCatBasicAuthUserName: authParameter.basicAuthUserName,
      configCatBasicAuthPassword: authParameter.basicAuthPassword
    });
  }
}
