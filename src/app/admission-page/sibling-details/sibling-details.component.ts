import { Component, Input, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { StudentDetailsService } from 'src/app/services/student-details.service';

@Component({
  selector: 'app-sibling-details',
  templateUrl: './sibling-details.component.html',
  styleUrls: ['./sibling-details.component.scss'],
})
export class SiblingDetailsComponent implements OnInit {
  @Input() siblings: any[];

  constructor(private alertController: AlertController, public studentDetailsService: StudentDetailsService) { }
  
  ngOnInit() { }
  
  calculateStudentAge(dob: any, refObj: any, key: string) {
    refObj[key] = this.studentDetailsService.calculateAge(dob);
  }

  addSibling() {
    this.siblings.push({});
  }

  removeSibling(index: number): void {
    this.siblings.splice(index, 1);
  }

  async deleteAlert(index: number) {
    const alert = await this.alertController.create({
      header: 'Delete Detail?',
      subHeader: 'This detail will be permanently deleted.',
      cssClass: 'custom-alert-style',
      mode: 'md',
      buttons: [
        {
          text: 'Cancel',
          cssClass: 'alert-button-cancel'
        },
        {
          text: 'Delete',
          handler: () => { this.removeSibling(index); },
          cssClass: 'alert-button-confirm'
        }
      ],
    });

    await alert.present();
  }
}
