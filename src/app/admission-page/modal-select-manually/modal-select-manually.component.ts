import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { StudentDetailsService } from 'src/app/services/student-details.service';
import { TextSpeechRecognitionService } from 'src/app/services/text-speech-recognition.service';

@Component({
  selector: 'app-modal-select-manually',
  templateUrl: './modal-select-manually.component.html',
  styleUrls: ['./modal-select-manually.component.scss'],
})
export class ModalSelectManuallyComponent implements OnInit {

  constructor(public textSpeechRecog: TextSpeechRecognitionService, public modalCtrl: ModalController,
    public studentDetailsService: StudentDetailsService ) { }

  ngOnInit() {}

}
