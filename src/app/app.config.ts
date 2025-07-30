import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from "@angular/core";
import { provideAnimations } from "@angular/platform-browser/animations";
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withRouterConfig,
} from "@angular/router";
import { routes } from "./app-routing.module";
import { AppModule } from "./app.module";

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(AppModule),
    provideZoneChangeDetection({ eventCoalescing: true, runCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: "enabled", anchorScrolling: "enabled" }),
      withComponentInputBinding(),
      withRouterConfig({ paramsInheritanceStrategy: "always" })
    ),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
  ],
};
