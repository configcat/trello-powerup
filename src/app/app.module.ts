import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthorizationComponent } from './authorization/authorization.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './home/home.component';
import { CommonModule } from '@angular/common';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { FeatureFlagsSettingsComponent } from './feature-flags-settings/feature-flags-settings.component';
import { AddFeatureFlagComponent } from './add-feature-flag/add-feature-flag.component';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { NgConfigCatPublicApiUIModule } from 'ng-configcat-publicapi-ui';
import { DeleteSettingDialogComponent } from './delete-setting-dialog/delete-setting-dialog.component';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { environment } from './../environments/environment';
import { CreateFeatureFlagComponent } from './create-feature-flag/create-feature-flag.component';
import { HttpClientModule } from '@angular/common/http';
import { LoaderComponent } from './loader/loader.component';

@NgModule({
  declarations: [
    AppComponent,
    AuthorizationComponent,
    HomeComponent,
    FeatureFlagsSettingsComponent,
    AddFeatureFlagComponent,
    DeleteSettingDialogComponent,
    CreateFeatureFlagComponent,
    LoaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatRadioModule,
    MatCardModule,
    NgConfigCatPublicApiUIModule.forRoot(() => ({ basePath: environment.publicApiBaseUrl, dashboardBasePath: environment.dashboardBasePath })),
    MatDialogModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
