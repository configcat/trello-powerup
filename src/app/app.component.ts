import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'configcat-trello-powerup';

  constructor() {
    console.log('app.compontent.ts - constructor');
  }
}

