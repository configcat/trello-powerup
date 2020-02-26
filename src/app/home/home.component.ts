import { Component, OnInit } from '@angular/core';
import { TrelloService } from '../services/trello.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private trelloService: TrelloService) {

  }

  ngOnInit(): void {
    this.trelloService.initialize();
  }

}
