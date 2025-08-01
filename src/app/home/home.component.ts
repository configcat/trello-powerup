import { Component, inject, OnInit } from "@angular/core";
import { TrelloService } from "../services/trello-service";

@Component({
  selector: "configcat-trello-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  private readonly trelloService = inject(TrelloService);

  ngOnInit(): void {
    this.trelloService.initialize();
  }

}
