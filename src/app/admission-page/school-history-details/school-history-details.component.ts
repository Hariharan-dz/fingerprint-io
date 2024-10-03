import { Component, Input, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { StudentDetailsService } from 'src/app/services/student-details.service';

@Component({
  selector: 'app-school-history-details',
  templateUrl: './school-history-details.component.html',
  styleUrls: ['./school-history-details.component.scss'],
})
export class SchoolHistoryDetailsComponent implements OnInit {
  @Input() schoolHistories: any[];

  constructor(private alertController: AlertController, public studentDetailsService: StudentDetailsService) { }

  ngOnInit() { }

  addSchoolHistoryCount() {
    this.schoolHistories.push({});
  }

  removeSchoolHistoryCount(index: number): void {
    this.schoolHistories.splice(index, 1);
  }

  async deleteAlert(index: number) {
    const alert = await this.alertController.create({
      header: 'Delete Detail?',
      subHeader: 'This detail will be permanently deleted.',
      cssClass: 'custom-alert-style',
      mode: 'md',
      // cssClass: 'custom-alert',
      buttons: [
        {
          text: 'Cancel',
          cssClass: 'alert-button-cancel'
        },
        {
          text: 'Delete',
          handler: () => { this.removeSchoolHistoryCount(index); },
          cssClass: 'alert-button-confirm'
        }
      ],
    });

    await alert.present();
  }
}
