import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-parent-details',
  templateUrl: './parent-details.component.html',
  styleUrls: ['./parent-details.component.scss'],
})
export class ParentDetailsComponent implements OnInit {

  @Input() student: any;

  constructor() { }

  ngOnInit() { }

}
