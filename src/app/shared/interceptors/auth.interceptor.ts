import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { Router } from "@angular/router";
import { NgZone } from "@angular/core";
import { Subscription } from "rxjs";
import { sessionTimeoutAction } from "state-management/actions/user.actions";
import { Store } from "@ngrx/store";
import { selectProfile } from "state-management/selectors/user.selectors";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private store: Store,
    private zone: NgZone,
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        const isSessionExpired =
          error.status === 401 && error.error?.message === "SESSION_EXPIRED";

        console.log("isSessionExpired", isSessionExpired);

        if (isSessionExpired) {
          this.store.dispatch(sessionTimeoutAction());

          const alreadyNotified = sessionStorage.getItem(
            "sessionExpiredNotified",
          );

          console.log("alreadyNotified", alreadyNotified);

          if (!alreadyNotified) {
            sessionStorage.setItem("sessionExpiredNotified", "true");

            const currentUrl = this.router.url;
            sessionStorage.setItem("postLoginRedirect", currentUrl);

            console.log("currentUrl", currentUrl);

            this.zone.run(() => {
              this.router.navigate(["/login"]);
            });
          }
        }

        return throwError(() => error);
      }),
    );
  }
}
