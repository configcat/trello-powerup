import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { AuthService } from "./services/auth.service";

@Injectable()
export class ForbiddenInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request)
      .pipe(
        catchError((error: Error) => {
          if (error instanceof HttpErrorResponse && error.status === 401) {
            void this.authService.removeAuthorizationParameters();
            return throwError(() => error);
          } else {
            return throwError(() => error);
          }
        })
      );
  }

}
