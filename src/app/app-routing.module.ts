import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';






const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },
  { path: 'authorize', loadComponent: () => import('./authorization/authorization.component').then(m => m.AuthorizationComponent) },
  { path: 'addfeatureflag', loadComponent: () => import('./add-feature-flag/add-feature-flag.component').then(m => m.AddFeatureFlagComponent) },
  { path: 'createfeatureflag', loadComponent: () => import('./create-feature-flag/create-feature-flag.component').then(m => m.CreateFeatureFlagComponent) },
  { path: 'featureflags', loadComponent: () => import('./feature-flags-settings/feature-flags-settings.component').then(m => m.FeatureFlagsSettingsComponent) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
