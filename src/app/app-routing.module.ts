import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthorizationComponent } from './authorization/authorization.component';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { AddFeatureFlagComponent } from './add-feature-flag/add-feature-flag.component';
import { FeatureFlagsSettingsComponent } from './feature-flags-settings/feature-flags-settings.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomeComponent },
  { path: 'authorize', component: AuthorizationComponent },
  { path: 'addfeatureflag', component: AddFeatureFlagComponent },
  { path: 'featureflags', component: FeatureFlagsSettingsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
