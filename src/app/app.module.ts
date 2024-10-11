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
import { AddFeatureFlagComponent } from './add-feature-flag/add-feature-flag.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { NgConfigCatPublicApiUIModule } from 'ng-configcat-publicapi-ui';
import { MatDialogModule } from '@angular/material/dialog';
import { environment } from './../environments/environment';
import { CreateFeatureFlagComponent } from './create-feature-flag/create-feature-flag.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { LoaderComponent } from './loader/loader.component';

@NgModule({ declarations: [
        AppComponent,
        AuthorizationComponent,
        HomeComponent,
        FeatureFlagsSettingsComponent,
        AddFeatureFlagComponent,
        CreateFeatureFlagComponent,
        LoaderComponent
    ],
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
        MatDialogModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class AppModule { }
