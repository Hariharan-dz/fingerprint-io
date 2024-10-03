import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { StorageService } from '../services/storage.service';
import { StudentDetailsService } from '../services/student-details.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnInit {

  userPin: any;
  password: any = {};
  oneDriveCredentials: any = {};
  inAppCredentials: any = {};
  emailTo: any = [];

  isAdminValidationSuccessfull: boolean = false;
  isAdminModelOpen: boolean;
  isDeveloperOptionEnabled: boolean = false;
  showPassword: boolean = false;

  hideShowPasswordObject: any = {
    secretIdPasswordShowHide: false,
    erpToolConfigPasswordShowHide: false,
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  };
  

  constructor(public modalCtrl: ModalController, private storageService: StorageService,
    private studentDetailsService: StudentDetailsService) {
    this.isAdminModelOpen = true;
  }

  async ngOnInit() {
    await this.getDataFromStorage();
  }

  async getDataFromStorage() {
    var detailsStoredInStorage: any = [
      { key: 'ONEDRIVE_CLIENT_ID', value: 'client_id', type: 'ONEDRIVE' },
      { key: 'ONEDRIVE_CLIENT_SECRET', value: 'secret_id', type: 'ONEDRIVE' },
      { key: 'ONEDRIVE_OBJECT_ID', value: 'object_id', type: 'ONEDRIVE' },
      { key: 'ONEDRIVE_TENANT_ID', value: 'tenant_id', type: 'ONEDRIVE' },
      { key: 'ONEDRIVE_FOLDER_PATH', value: 'folder_path', type: 'ONEDRIVE' },

      { key: 'ERP_ADMISSION_APP_NOTIFICATION_EMAIL', value: 'email_to', type: 'EMAILID' },

      { key: 'ERP_ADMISSION_APP_URL', value: 'site_url', type: 'INAPP' },
      { key: 'ERP_ADMISSION_APP_USERNAME', value: 'user_name', type: 'INAPP' },
      { key: 'ERP_ADMISSION_APP_PASSWORD', value: 'password', type: 'INAPP' },
      { key: 'ERP_ADMISSION_ADD_STUDENT_URL', value: 'add_student_url', type: 'INAPP' },

      { key: 'IS_DEVELOPER_OPTIONS_ENABLED', value: 'isDeveloperOptionEnabled', type: 'DEV_OPTION' }
    ];
    detailsStoredInStorage.forEach(async (element: any) => {
      let keyData = await this.storageService.storage.get(element.key);
      try {
        if (element.type === 'ONEDRIVE') {
          this.oneDriveCredentials[element.value] = keyData;
        }
        if (element.type === 'INAPP') {
          this.inAppCredentials[element.value] = keyData;
        }
        if (element.type === 'DEV_OPTION') {
          this.isDeveloperOptionEnabled = (keyData == 'TRUE');
        }
        if (element.type === 'EMAILID') {
          this.emailTo = keyData.split(',').map((emailId: any) => {
            return { 'email_to': emailId };
          });
        }
      } catch (error) {
        this.studentDetailsService.presentAlert(error);
      }

    });
  }

  async updateNewPassword() {
    try {
      if (!this.password.old_password) throw 'Please enter old password';
      if (!this.password.new_password) throw 'Please enter New password';
      if (!this.password.confirm_new_password) throw 'Please enter confirm password';
      var auth = await this.storageService.storage.get('ADMIN_LOGIN_PIN');
      if (auth === this.password.old_password) {
        if (this.password.new_password === this.password.new_password) {
          await this.storageService.storage.set('ADMIN_LOGIN_PIN', this.password.new_password);
          this.modalCtrl.dismiss();
          this.password = {};
        } else {
          throw 'New password and Confirm password are not matching';
        }
      } else {
        throw 'Incorrect old password';
      }
    } catch (error: any) {
      await this.studentDetailsService.presentAlert(error);
    }
    // need to reload the app
  }

  async updateOneDriveCredential() {
    console.log(this.oneDriveCredentials);
    try {
      if (this.oneDriveCredentials.client_id) {
        await this.storageService.storage.set('ONEDRIVE_CLIENT_ID', this.oneDriveCredentials.client_id);
      }
      if (this.oneDriveCredentials.secret_id) {
        await this.storageService.storage.set('ONEDRIVE_CLIENT_SECRET', this.oneDriveCredentials.secret_id);
      }
      if (this.oneDriveCredentials.object_id) {
        await this.storageService.storage.set('ONEDRIVE_OBJECT_ID', this.oneDriveCredentials.object_id);
      }
      if (this.oneDriveCredentials.tenant_id) {
        await this.storageService.storage.set('ONEDRIVE_TENANT_ID', this.oneDriveCredentials.tenant_id);
      }
      if (this.oneDriveCredentials.folder_path) {
        await this.storageService.storage.set('ONEDRIVE_FOLDER_PATH', this.oneDriveCredentials.folder_path);
      }
      this.modalCtrl.dismiss();
    } catch (error: any) {
      await this.studentDetailsService.presentAlert(error);
    }
    // need to reload the app
  }

  async updateInappCredential() {
    try {
      if (this.inAppCredentials.user_name) throw 'Please enter Username'
      if (this.inAppCredentials.password) throw 'Please enter password'
      if (this.inAppCredentials.site_url) throw 'Please enter site_url'
      console.log(this.inAppCredentials, 'INAPP CREDI');
      this.modalCtrl.dismiss();
    } catch (error: any) {
      await this.studentDetailsService.presentAlert(error);
    }
  }

  addEmailID() {
    this.emailTo.push({});
  }

  deleteEmailAddress(index: number) {
    this.emailTo.splice(index, 1);
  }

  async updateEmailToAddress() {
    try {
      const emailToAddresses = this.emailTo.map((id: any) => id.email_to).join(',');
      await this.storageService.storage.set('ERP_ADMISSION_APP_NOTIFICATION_EMAIL', emailToAddresses);
      this.modalCtrl.dismiss();
    } catch (error) {
      this.studentDetailsService.presentAlert(error);
    }
  }

  async developerOptions() {
    await this.storageService.storage.set('IS_DEVELOPER_OPTIONS_ENABLED', this.isDeveloperOptionEnabled ? 'TRUE' : 'FALSE');
  }

  async adminPasswordValidation() {
    try {
      if (!this.userPin) throw 'Please enter a PIN'
      var auth = await this.storageService.storage.get('ADMIN_LOGIN_PIN');
      if (auth === this.userPin) {
        this.modalCtrl.dismiss();
        this.userPin = null;
        this.isAdminValidationSuccessfull = true;
      } else {
        throw "Invalid Credentials";
      }
    } catch (error: any) {
      await this.studentDetailsService.presentAlert(error);
    }
  }

  passwordShowHide(fields: string) {
    this.hideShowPasswordObject[fields] = !this.hideShowPasswordObject[fields];
  }

}
