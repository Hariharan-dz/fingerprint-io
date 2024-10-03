import { Component, Input, OnInit } from '@angular/core';
import { PhotoService } from 'src/app/services/photo.service';
import { StudentDetailsService } from 'src/app/services/student-details.service';

import { SpeechRecognition } from '@capacitor-community/speech-recognition';

@Component({
  selector: 'app-student-details',
  templateUrl: './student-details.component.html',
  styleUrls: ['./student-details.component.scss'],
})
export class StudentDetailsComponent implements OnInit {

  @Input() student: any = {};
  speechArray: any;

  constructor(private photoService: PhotoService, public studentDetailsService: StudentDetailsService) {
    SpeechRecognition.requestPermission();
  }

  ngOnInit() {  }

  async takePhoto() {
    this.student.photo = await this.photoService.takePhoto();
  }

  calculateStudentAge(dob: any, refObj: any, key: string) {
    refObj[key] = this.studentDetailsService.calculateAge(dob);
  }

}
