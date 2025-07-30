import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgConfigCatPublicApiUIModule } from "ng-configcat-publicapi-ui";
import { environment } from "./../environments/environment";
import { AddFeatureFlagComponent } from "./add-feature-flag/add-feature-flag.component";
import { AppRoutingModule } from "./app-routing.module";
import { AuthComponent } from "./authorization/authorization.component";
import { CreateFeatureFlagComponent } from "./create-feature-flag/create-feature-flag.component";
import { FeatureFlagsSettingsComponent } from "./feature-flags-settings/feature-flags-settings.component";
import { HomeComponent } from "./home/home.component";
import { LoaderComponent } from "./loader/loader.component";

@NgModule({
  imports: [BrowserModule,
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
    MatDialogModule,
    AuthComponent,
    HomeComponent,
    FeatureFlagsSettingsComponent,
    AddFeatureFlagComponent,
    CreateFeatureFlagComponent,
    LoaderComponent],

  // providers: [provideHttpClient(withInterceptorsFromDi())]
})
export class AppModule { }
