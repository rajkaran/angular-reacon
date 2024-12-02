import { AfterViewChecked, AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { delay } from 'rxjs/operators';
import { SecureLayoutService } from 'src/app/core/broadcasts/secure-layout.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'wx-secure-layout',
  templateUrl: './secure-layout.component.html',
  styleUrls: ['./secure-layout.component.scss']
})
export class SecureLayoutComponent implements OnInit, OnDestroy {
  @ViewChild('drawer', {static: true}) drawer: MatDrawer;

  opened: boolean = true;
  pageTitle: string = '';
  subsinks: SubSink = new SubSink();

  constructor(
    private secureLayoutBroadcast: SecureLayoutService
  ) { }

  ngOnInit(): void {
    this.tapBroadcastedEvent();
  }

  tapBroadcastedEvent(){
    // update page title for every page
    this.subsinks.sink = this.secureLayoutBroadcast.listenPageTitleEvent()
    .pipe(
      delay(0)
    )
    .subscribe( (pageTitle: string) => {
      this.pageTitle = pageTitle;
    });

    // adjust the state of sidebar either open or close
    this.subsinks.sink = this.secureLayoutBroadcast.listenSidebarEvent()
    .subscribe( (status: boolean) => {
      if(status) this.drawer.open()
      else this.drawer.close()
    });
  }

  ngOnDestroy(){
    this.subsinks.unsubscribe();
  }

}
