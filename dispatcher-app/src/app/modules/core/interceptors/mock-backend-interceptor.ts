import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';

@Injectable()
export class MockBackendInterceptor implements HttpInterceptor {
    constructor() { }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return of();
    }
}