import { Component, OnInit, input } from '@angular/core';

declare let Snap: any;
declare let mina: any;

@Component({
    selector: 'app-loader',
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.scss'],
    imports: []
})
export class LoaderComponent implements OnInit {

  set: any;
  showLoader = false;
  readonly skipTimeOut = input<boolean>(undefined);

  constructor() {
    //empty constructor
  }

  ngOnInit() {
    if (this.skipTimeOut()) {
      this.showLoader = true;
    } else {
      setTimeout(() => this.showLoader = true, 300);
    }
  }
}
