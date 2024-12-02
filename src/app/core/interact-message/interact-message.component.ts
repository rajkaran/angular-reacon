import { Component, OnInit, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'wx-interact-message',
  templateUrl: './interact-message.component.html',
  styleUrls: ['./interact-message.component.scss']
})
export class InteractMessageComponent implements OnInit {

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) { }

  ngOnInit(): void {
  }

}
