import { Component, OnInit } from '@angular/core';
import { StudentDetailsService } from '../services/student-details.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { environment } from 'src/environments/environment';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';
import { EmailComposerService } from '../services/email-composer.service';
declare const Fingerprint: any;
import { KeychainTouchId } from '@ionic-native/keychain-touch-id/ngx';
import { Platform } from '@ionic/angular';
declare var cordova: any;
import { TouchID } from '@ionic-native/touch-id/ngx';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnInit {
  userPin: any;
  showPassword: any;
  storagedPin: any;
  credentials: any = {};

  constructor(private touchId: TouchID, private platform: Platform, private keychainTouchId: KeychainTouchId, private authService: EmailComposerService, private fingerprintAIO: FingerprintAIO, private studentDetailsService: StudentDetailsService, private alertController: AlertController,
    private router: Router, private storageService: StorageService) {
    this.init()
  }

  ngOnInit() {
    function generateRandomString(length: number): string {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';

      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      return result;
    }

    const clientId = generateRandomString(10);
    const clientSecret = generateRandomString(16);

    console.log('Client ID:', clientId);
    console.log('Client Secret:', clientSecret);
  }

  async init() {
    const details = {
      'ADMIN_LOGIN_PIN': environment.ADMIN_LOGIN_PIN,

      'ONEDRIVE_CLIENT_ID': environment.ONEDRIVE_CLIENT_ID,
      'ONEDRIVE_CLIENT_SECRET': environment.ONEDRIVE_CLIENT_SECRET,
      'ONEDRIVE_OBJECT_ID': environment.ONEDRIVE_OBJECT_ID,
      'ONEDRIVE_TENANT_ID': environment.ONEDRIVE_TENANT_ID,
      'ONEDRIVE_FOLDER_PATH': environment.ONEDRIVE_FOLDER_PATH,

      'IS_DEVELOPER_OPTIONS_ENABLED': environment.IS_DEVELOPER_OPTIONS_ENABLED,

      'ERP_ADMISSION_APP_NOTIFICATION_EMAIL': environment.ERP_ADMISSION_APP_NOTIFICATION_EMAIL,

      'ERP_ADMISSION_APP_URL': environment.ERP_ADMISSION_APP_URL,
      'ERP_ADMISSION_ADD_STUDENT_URL': environment.ERP_ADMISSION_ADD_STUDENT_URL,
      'ERP_ADMISSION_APP_USERNAME': environment.ERP_ADMISSION_APP_USERNAME,
      'ERP_ADMISSION_APP_PASSWORD': environment.ERP_ADMISSION_APP_PASSWORD
    };
    Object.entries(details).forEach(async ([key, value]) => {
      const existingValue: any = await this.storageService.storage.get(key);
      if (!existingValue) this.storageService.storage.set(key, value);
    });
  }

  async login() {
    await this.studentDetailsService.showLoader();
    try {
      if (!this.userPin) throw 'Please Enter a PIN';
      var auth = await this.storageService.storage.get('ADMIN_LOGIN_PIN');
      if (this.userPin == auth) {
        this.router.navigateByUrl('/home');
        this.studentDetailsService.hideLoader();
      } else {
        throw 'Invalid Credentials';
      }
    } catch (err: any) {
      this.studentDetailsService.hideLoader();
      this.studentDetailsService.presentAlert(err);
    }
  }

  passwordShowHide() {
    this.showPassword = !this.showPassword;
  }
  checkBiometric() {
    this.fingerprintAIO.show({
      title: 'Biometric Authentication',
      description: 'Use your biometric data to access the app',
      fallbackButtonTitle: 'Use PIN',
      disableBackup: true
    })
      .then(() => {
        this.userPin = '1234';
        this.login();
        // Biometric authentication success
        console.log('Biometric authentication successful');
      })
      .catch((error: any) => {
        // Biometric authentication failure
        console.error('Biometric authentication failed:', error);
      });
  }
  // async authenticateWithFaceLock() {
  //   try {
  //     const result = await Fingerprint.isAvailable();

  //     if (result === 'OK') {
  //       const authResult = await Fingerprint.show({
  //         clientId: 'your_app_id',
  //         clientSecret: 'your_app_secret',
  //         disableBackup: true,
  //         localizedFallbackTitle: 'Use Pin',
  //         localizedReason: 'Please authenticate using your face.',
  //       });

  //       if (authResult === 'OK') {
  //         // Face lock authentication successful
  //         console.log('Face lock authentication successful');
  //       } else {
  //         // Face lock authentication failed
  //         console.log('Face lock authentication failed');
  //       }
  //     } else {
  //       // Face lock not available on the device
  //       console.log('Face lock not available');
  //     }
  //   } catch (error) {
  //     // An error occurred during face lock authentication
  //     console.error('Face lock authentication error:', error);
  //   }
  // }

  // checkTouchId() {
  //   this.keychainTouchId.isAvailable()
  //     .then((res: any) => console.log('Touch ID is available', res))
  //     .catch((error: any) => console.error('Touch ID is not available', error));
  // }

  // authenticateWithTouchId() {
  //   //   this.keychainTouchId.verifyFingerprint('Authenticate using Touch ID')
  //   //     .then((res: any) => console.log('Touch ID authentication succeeded', res))
  //   //     .catch((error: any) => console.error('Touch ID authentication failed', error));
  //   // }
  //   if (this.platform.is('android')) {
  //     if (Fingerprint) {
  //       Fingerprint.isAvailable((result: any) => {
  //         if (result.isAvailable && result.hasEnrolledFingerprints) {
  //           Fingerprint.show({
  //             clientId: 'your_app_id',
  //             clientSecret: 'your_app_secret',
  //             disableBackup: true,
  //             localizedFallbackTitle: 'Use face authentication',
  //             localizedReason: 'Authenticate using your face',
  //           }, (success: any) => {
  //             // Face authentication successful, proceed with app access
  //             console.log('Face authentication successful');
  //           }, (error: any) => {
  //             // Face authentication failed or canceled
  //             console.log('Face authentication failed or canceled', error);
  //           });
  //         } else {
  //           console.log('Face lock not available');
  //           // Handle face lock not available
  //         }
  //       });
  //     } else {
  //       console.log('FingerprintAuth plugin not available');
  //       // Handle plugin not available
  //     }
  //   } else {
  //     console.log('Face lock is only available on Android devices');
  //     // Handle unsupported platform
  //   }
  // }
}
