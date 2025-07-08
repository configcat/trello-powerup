import { Component, OnInit, inject } from '@angular/core';
import { TrelloBootstrapService } from '../services/trello-bootstrap.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private trelloBootstrapService = inject(TrelloBootstrapService);


  ngOnInit(): void {
    this.trelloBootstrapService.initialize();
  }

}
