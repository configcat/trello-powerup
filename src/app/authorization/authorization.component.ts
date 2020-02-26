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

  formGroup: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private trelloService: TrelloService) { }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      basicAuthUserName: ['', [Validators.required]],
      basicAuthPassword: ['', [Validators.required]]
    });
  }

  onSubmit() {
    TrelloPowerUp.iframe().set('organization', 'shared', {
      configCatBasicAuthUserName: this.formGroup.value.basicAuthUserName,
      configCatBasicAuthPassword: this.formGroup.value.basicAuthPassword
    });
  }
}
