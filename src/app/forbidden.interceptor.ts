import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, Observable, throwError } from "rxjs";
import { TrelloService } from "./services/trello-service";

@Injectable()
export class ForbiddenInterceptor implements HttpInterceptor {
  private readonly trelloService = inject(TrelloService);
  private readonly router = inject(Router);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request)
      .pipe(
        catchError((error: Error) => {
          if (error instanceof HttpErrorResponse && error.status === 401) {
            console.log("Unauthorized access detected. Redirecting to authorization page.");
            void this.trelloService.removeAuthorizationParameters();
            void this.router.navigate(["/authorize"]);
            return throwError(() => error);
          } else {
            return throwError(() => error);
          }
        })
      );
  }

}
