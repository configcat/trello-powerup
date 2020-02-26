import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TrelloService } from '../services/trello.service';

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
    const t = this.trelloService.iframe();
    return this.trelloService.setAuthorizationParameters(t, this.formGroup.value)
      .finally(t.closePopup());
  }
}
