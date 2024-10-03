import { Component, Input, OnInit } from '@angular/core';
import { StudentDetailsService } from 'src/app/services/student-details.service';
import { TextSpeechRecognitionService } from 'src/app/services/text-speech-recognition.service';

@Component({
  selector: 'app-termsandconditions',
  templateUrl: './termsandconditions.component.html',
  styleUrls: ['./termsandconditions.component.scss'],
})
export class TermsandconditionsComponent implements OnInit {
  
  @Input() student: any;

  constructor(private studentDetailsService: StudentDetailsService, public textSpeechRecognitionService: TextSpeechRecognitionService) { }

  ngOnInit() { }

  async enabledTAC() {
    if(this.student.isAgreeTAC && this.textSpeechRecognitionService.isVoiceEnabled){
      await this.studentDetailsService.startRecording(7, 1);
    }
  }

}


