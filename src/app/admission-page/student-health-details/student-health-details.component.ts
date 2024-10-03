import { Component, OnInit, Input } from '@angular/core';
import { StudentDetailsService } from 'src/app/services/student-details.service';

@Component({
  selector: 'app-student-health-details',
  templateUrl: './student-health-details.component.html',
  styleUrls: ['./student-health-details.component.scss'],
})

export class StudentHealthDetailsComponent implements OnInit {

  @Input() student: any;
  
  constructor(public studentDetailsService: StudentDetailsService) { }

  ngOnInit() { }

}
