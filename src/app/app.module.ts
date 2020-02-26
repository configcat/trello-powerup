import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthorizationComponent } from './authorization/authorization.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './home/home.component';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FeatureFlagsSettingsComponent } from './feature-flags-settings/feature-flags-settings.component';
import { SettingItemComponent } from './feature-flags-settings/setting-item/setting-item.component';
import { ValueGangComponent } from './feature-flags-settings/setting-item/value-gang/value-gang.component';
import { TargetingRulesComponent } from './feature-flags-settings/setting-item/targeting-rules/targeting-rules.component';
import { PercentageRulesComponent } from './feature-flags-settings/setting-item/percentage-rules/percentage-rules.component';
import { AddFeatureFlagComponent } from './add-feature-flag/add-feature-flag.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [
    AppComponent,
    AuthorizationComponent,
    HomeComponent,
    FeatureFlagsSettingsComponent,
    SettingItemComponent,
    ValueGangComponent,
    TargetingRulesComponent,
    PercentageRulesComponent,
    AddFeatureFlagComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatRadioModule,
    MatCardModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
