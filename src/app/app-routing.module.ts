import { Routes } from "@angular/router";

export const routes: Routes = [
  { path: "", pathMatch: "full", loadComponent: () => import("./home/home.component").then(m => m.HomeComponent) },
  { path: "authorize", loadComponent: () => import("./authorization/authorization.component").then(m => m.AuthComponent) },
  { path: "addfeatureflag", loadComponent: () => import("./add-feature-flag/add-feature-flag.component").then(m => m.AddFeatureFlagComponent) },
  { path: "createfeatureflag", loadComponent: () => import("./create-feature-flag/create-feature-flag.component").then(m => m.CreateLinkFeatureFlagComponent) },
  { path: "featureflags", loadComponent: () => import("./feature-flags-settings/feature-flags-settings.component").then(m => m.FeatureFlagsSettingsComponent) },
];
