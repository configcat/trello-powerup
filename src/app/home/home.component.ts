import { Component, OnInit } from '@angular/core';
import { TrelloBootstrapService } from '../services/trello-bootstrap.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private trelloBootstrapService: TrelloBootstrapService) {
  }

  ngOnInit(): void {
    this.trelloBootstrapService.initialize();
  }

}
