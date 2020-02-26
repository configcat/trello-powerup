import { Component } from '@angular/core';
import { TrelloService } from './services/trello.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'configcat-trello-powerup';

  constructor(private trelloService: TrelloService) {
    trelloService.initialize();
  }

}

