import { CommonModule } from "@angular/common";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { BrowserModule } from '@angular/platform-browser';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthorizationComponent } from './authorization/authorization.component';
import { CreateFeatureFlagComponent } from "./create-feature-flag/create-feature-flag.component";
import { FeatureFlagsSettingsComponent } from "./feature-flags-settings/feature-flags-settings.component";
import { HomeComponent } from "./home/home.component";
import { AddFeatureFlagComponent } from "./add-feature-flag/add-feature-flag.component";
import { MatRadioModule } from "@angular/material/radio";
import { NgConfigCatPublicApiUIModule } from "ng-configcat-publicapi-ui";
import { environment } from "./../environments/environment";
import { LoaderComponent } from "./loader/loader.component";

@NgModule({ declarations: [AppComponent],
  bootstrap: [AppComponent], imports: [BrowserModule,
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
    NgConfigCatPublicApiUIModule.forRoot(() => ({ basePath: environment.publicApiBaseUrl, dashboardBasePath: environment.dashboardBasePath })),
    MatDialogModule, AuthorizationComponent,
    HomeComponent,
    FeatureFlagsSettingsComponent,
    AddFeatureFlagComponent,
    CreateFeatureFlagComponent,
    LoaderComponent], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class AppModule { }
