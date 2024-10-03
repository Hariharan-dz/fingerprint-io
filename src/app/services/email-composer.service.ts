import { Injectable } from '@angular/core';
import { EmailComposer } from 'capacitor-email-composer';
import { StorageService } from './storage.service';
import { Platform } from '@ionic/angular';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';

@Injectable({
  providedIn: 'root'
})
export class EmailComposerService {
  constructor(private fingerprintAIO: FingerprintAIO, private platform: Platform, private storageService: StorageService) { }

  async sendEmail(studentRegistrationNumber: number, oneDriveFolderDetails: any, student: any) {
    let ERP_ADMISSION_APP_NOTIFICATION_EMAIL = await this.storageService.storage.get("ERP_ADMISSION_APP_NOTIFICATION_EMAIL");
    const pdf: any = await EmailComposer.open({
      to: ERP_ADMISSION_APP_NOTIFICATION_EMAIL.split(","),
      subject: `Student Admission - ${studentRegistrationNumber} [${student.first_name} ${student.last_name}]`,
      isHtml: true,
      body: `<span>Hi All,</span><br><br>
        <span>We are pleased to inform that the new student registration has been completed successfully. Kindly refer to the information provided below:,</span><br><br>
        <span><b>Registration Number:</b> ${studentRegistrationNumber}</span><br>
        <span><b>Student Name:</b> ${student.first_name} ${student.last_name}</span><br><br>
        <span>To access the necessary documents, please click on the following link:</span><br>
        <span>${oneDriveFolderDetails.webUrl}</span><br><br>
        <span>Thanks,</span><br>
        <span>Admission App</span>`
    });
  }

  // showBiometricPrompt(): Promise<any> {
  //   return this.fingerprintAIO.show({
  //     description: 'Unlock with Face',
  //     fallbackButtonTitle: 'Use App Password'
  //   });
  // }
}
