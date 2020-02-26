import { Component, OnInit, Input } from '@angular/core';
import { ConfigcatPublicApiService } from 'src/app/services/configcat-public-api.service';

@Component({
  selector: 'app-setting-item',
  templateUrl: './setting-item.component.html',
  styleUrls: ['./setting-item.component.scss']
})
export class SettingItemComponent implements OnInit {

  @Input() settingId: number;
  @Input() environmentId: string;

  settingValue: any;

  constructor(private configcatPublicApiService: ConfigcatPublicApiService) { }

  ngOnInit(): void {
    this.configcatPublicApiService.getSettingValues(this.environmentId, this.settingId)
      .then(settingValue => {
        this.settingValue = settingValue;
      });
  }

}
