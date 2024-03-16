import { Component, OnInit, Input } from '@angular/core';
declare let Snap: any;
declare let mina: any;

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {

  set: any;
  showLoader = false;
  @Input() skipTimeOut?: boolean;

  constructor() {
    //empty constructor
  }

  ngOnInit() {
    if (this.skipTimeOut) {
      this.showLoader = true;
    } else {
      setTimeout(() => this.showLoader = true, 300);
    }
  }
}
