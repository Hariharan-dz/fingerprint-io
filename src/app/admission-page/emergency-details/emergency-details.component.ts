import { Component, OnInit, Input } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-emergency-details',
  templateUrl: './emergency-details.component.html',
  styleUrls: ['./emergency-details.component.scss'],
  animations: [
    trigger('myAnimationTrigger', [
      state('void', style({ opacity: 0 })),
      state('*', style({ opacity: 1 })),
      transition('void => *', animate('0.3s ease-in'))
    ])
  ]
})
export class EmergencyDetailsComponent implements OnInit {

  @Input() student: any;

  constructor() { }

  ngOnInit() { }

}
