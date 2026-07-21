import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
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
import { environment } from "../environments/environment";
import { routes } from "./app-routing.module";
import { ForbiddenInterceptor } from "./forbidden.interceptor";

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
    { provide: HTTP_INTERCEPTORS, useClass: ForbiddenInterceptor, multi: true },
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: CONFIGCAT_PUBLICAPI_UI_CONFIGURATION,
      useValue: { basePath: environment.publicApiBaseUrl, dashboardBasePath: environment.dashboardBasePath },
    },
    provideConfigCatPublicApiUi(),
  ],
};
