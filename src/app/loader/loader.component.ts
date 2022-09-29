import { Component, OnInit, Input } from '@angular/core';
declare var Snap: any;
declare var mina: any;

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {

  set: any;
  showLoader = false;
  @Input() skipTimeOut?: boolean;

  constructor() { }

  ngOnInit() {
    if (this.skipTimeOut) {
      this.showLoader = true;
    } else {
      setTimeout(() => this.showLoader = true, 500);
    }
  }
}
