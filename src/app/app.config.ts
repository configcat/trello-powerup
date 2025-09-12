import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from "@angular/core";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDialogModule } from "@angular/material/dialog";
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withRouterConfig,
} from "@angular/router";
import { CONFIGCAT_PUBLICAPI_UI_CONFIGURATION, provideConfigCatPublicApiUi } from "ng-configcat-publicapi-ui";
import { environment } from "src/environments/environment";
import { routes } from "./app-routing.module";

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      MatDialogModule,
      MatNativeDateModule
    ),
    provideZoneChangeDetection({ eventCoalescing: true, runCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: "enabled", anchorScrolling: "enabled" }),
      withComponentInputBinding(),
      withRouterConfig({ paramsInheritanceStrategy: "always" })
    ),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: CONFIGCAT_PUBLICAPI_UI_CONFIGURATION,
      useValue: { basePath: environment.publicApiBaseUrl, dashboardBasePath: environment.dashboardBasePath },
    },
    provideConfigCatPublicApiUi(),
  ],
};
