import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SecureLayoutService {

  pageTitle = new Subject<string>();
  sidebar = new Subject<boolean>();

  constructor() { }

  emitPageTitleEvent(cssClass: string): void {
    this.pageTitle.next(cssClass);
  }
  listenPageTitleEvent(): Observable<string> {
    return this.pageTitle.asObservable();
  }

  emitSidebarEvent(flag: boolean): void {
    this.sidebar.next(flag);
  }
  listenSidebarEvent(): Observable<boolean> {
    return this.sidebar.asObservable();
  }


}
