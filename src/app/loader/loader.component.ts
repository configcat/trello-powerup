import { Component, input, OnInit } from "@angular/core";

@Component({
  selector: "configcat-trello-loader",
  templateUrl: "./loader.component.html",
  styleUrls: ["./loader.component.scss"],
  imports: [],
})
export class LoaderComponent implements OnInit {
  showLoader = false;
  readonly skipTimeOut = input<boolean>(false);

  ngOnInit() {
    if (this.skipTimeOut()) {
      this.showLoader = true;
    } else {
      setTimeout(() => this.showLoader = true, 300);
    }
  }
}
