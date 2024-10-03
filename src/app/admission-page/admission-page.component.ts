import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AlertController, isPlatform } from '@ionic/angular';
import * as moment from 'moment';

import { OCRService } from '../services/ocr.service';
import { OneDriveService } from '../services/one-drive.service';
import { StudentDetailsService } from '../services/student-details.service';
import { TextSpeechRecognitionService } from '../services/text-speech-recognition.service';
import { PDFGenerator } from '@ionic-native/pdf-generator/ngx';
import { StorageService } from '../services/storage.service';
import { InAppBrowserService } from '../services/in-app-browser.service';
import { EmailComposerService } from '../services/email-composer.service';


@Component({
  selector: 'app-admission-page',
  templateUrl: './admission-page.component.html',
  styleUrls: ['./admission-page.component.scss'],
  animations: [
    trigger('animation', [
      state('void', style({ opacity: 0 })),
      state('*', style({ opacity: 1 })),
      transition('void => *', animate('0.8s ease-in'))
    ])
  ]
})
export class AdmissionPageComponent implements OnInit {

  @ViewChild("admissionStateStepper", { read: ElementRef }) admissionStateStepper: ElementRef;
  activeStep: any = {};
  isModuleOpen = false;
  base64Content: string;
  emailRegex: any = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  lastPageModalPopup: boolean = false;
  goToHome: boolean = false;
  userPin: any;
  uploadedFolderDetails: any = {};

  student: any = {
    relationType: 'parents',
    isAgreeTAC: false,
    documents: {},
    signature: {},
    siblings: [{}],
    schoolHistories: [{}]
  };
  dateFieldList: any = ['dob'];
  steps: any = [
    {
      stepIndex: 0,
      name: 'Documents',
      type: 'DOCMT',
      icon: 'document-attach-outline',
      title: 'Documents'
    },
    {
      stepIndex: 1,
      name: 'Student\'s Personal Details',
      type: 'PERSONAL',
      icon: 'person-outline',
      title: 'Personal Details'
    },
    {
      stepIndex: 2,
      name: 'Student\'s Health Details',
      type: 'HEALTH',
      icon: 'medkit-outline',
      title: 'Medical Details'
    },
    {
      stepIndex: 3,
      name: 'Parent / Guardian Information',
      type: 'PARENT',
      icon: 'people-outline',
      title: 'Parent / Guardian '
    },
    {
      stepIndex: 4,
      name: 'Emergency Contact Details',
      type: 'CONTACT',
      icon: 'call-outline',
      title: 'Emergency Contact '
    },
    {
      stepIndex: 5,
      name: 'Sibling Details',
      type: 'SIBLING',
      icon: 'people-circle-outline',
      title: 'Sibling Details '
    },
    {
      stepIndex: 6,
      name: 'School History',
      type: 'SCHOOL',
      icon: 'school-outline',
      title: 'School History'
    },

    {
      stepIndex: 7,
      name: 'Terms and Conditions',
      type: 'TAC',
      icon: 'book-outline',
      title: 'Terms and Conditions'

    },
    {
      stepIndex: 8,
      name: 'Declaration',
      type: 'DECLARATION',
      icon: 'document-text-outline',
      title: 'Declaration'

    },
    {
      stepIndex: 9,
      name: 'Preview',
      type: 'PREVIEW',
      icon: 'receipt-outline',
      title: 'Preview'

    }
  ];

  constructor(private alertController: AlertController, private ocrService: OCRService,
    private studentDetailsService: StudentDetailsService, public textSpeechRecognitionService: TextSpeechRecognitionService,
    private oneDrive: OneDriveService, private pdfGenerator: PDFGenerator, private storageService: StorageService,
    private inAppBrowserService: InAppBrowserService, private emailComposser: EmailComposerService) {
    this.activeStep = this.steps[0];
  }

  ngOnInit() {
    this.studentDetailsService.init(this.student);
    this.studentDetailsService.autoLockDisable();
  }

  ionViewDidEnter() {
    this.admissionStateStepper.nativeElement.stepNext('success');
  }

  isValidForm() {
    try {
      var documents = this.student.documents;
      switch (this.activeStep.type) {
        case "DOCMT":
          if (documents.student_aadhar_frontView && !documents.student_aadhar_backView) {
            this.showErrorMsg('Student back view aadhar should be manditory');
            return false;
          } else if (documents.student_aadhar_backView && !documents.student_aadhar_frontView) {
            this.showErrorMsg('Student front view aadhar should be manditory');
            return false;
          } else if (documents.father_aadhar_frontView && !documents.father_aadhar_backView) {
            this.showErrorMsg('Father back view aadhar should be manditory');
            return false;
          } else if (documents.father_aadhar_backView && !documents.father_aadhar_frontView) {
            this.showErrorMsg('Father front view aadhar should be manditory');
            return false;
          } else if (documents.mother_aadhar_frontView && !documents.mother_aadhar_backView) {
            this.showErrorMsg('Mother back view aadhar should be manditory');
            return false;
          } else if (documents.mother_aadhar_backView && !documents.mother_aadhar_frontView) {
            this.showErrorMsg('Mother front view aadhar should be manditory');
            return false;
          } else if (documents.guardian_aadhar_frontView && !documents.guardian_aadhar_backView) {
            this.showErrorMsg('Guardian back view aadhar should be manditory');
            return false;
          } else if (documents.guardian_aadhar_backView && !documents.guardian_aadhar_frontView) {
            this.showErrorMsg('Guardian front view aadhar should be manditory');
            return false;
          }
          break;
        case "PERSONAL":
          if (!this.student.first_name) {
            this.showErrorMsg('Please enter student First Name');
            return false;
          } else if (!this.student.dob) {
            this.showErrorMsg('Please enter student Date Of Birth');
            return false;
          } else if (!this.student.gender) {
            this.showErrorMsg('Please select student Gender');
            return false;
          } else if (!this.student.master_class_id) {
            this.showErrorMsg('Please select the student class/standard');
            return false;
          }
          break;
        case "HEALTH":

          break;
        case "PARENT":
          if (this.student.residence_phone && this.student.residence_phone.length < 10) {
            this.showErrorMsg('Mobile number should be 10 digits');
            return false;
          } else if (this.student.father_whatsapp_number && this.student.father_whatsapp_number.length < 10) {
            this.showErrorMsg('Whatsapp number should be 10 digits');
            return false;
          } else if (this.student.father_primary_contect_number && this.student.father_primary_contect_number.length < 10) {
            this.showErrorMsg('Primary number should be 10 digits');
            return false;
          } else if (this.student.father_office_contact_number && this.student.father_office_contact_number.length < 10) {
            this.showErrorMsg('Office number should be 10 digits');
            return false;
          } else if (this.student.parent_email && !this.emailRegex.test(this.student.parent_email)) {
            this.showErrorMsg('Please enter the correct Father Email Id.');
            return false;
          } else if (this.student.mother_mobile && this.student.mother_mobile.length < 10) {
            this.showErrorMsg('Mobile number should be 10 digits');
            return false;
          } else if (this.student.mother_whatsapp_number && this.student.mother_whatsapp_number.length < 10) {
            this.showErrorMsg('Whatsapp number should be 10 digits');
            return false;
          } else if (this.student.mother_office_contact_number && this.student.mother_office_contact_number.length < 10) {
            this.showErrorMsg('Office number should be 10 digits');
            return false;
          } else if (this.student.mother_primary_contect_number && this.student.mother_primary_contect_number.length < 10) {
            this.showErrorMsg('Primary phone number should be 10 digits');
            return false;
          } else if (this.student.mother_email && !this.emailRegex.test(this.student.mother_email)) {
            this.showErrorMsg('Please enter the correct Mother Email Id.');
            return false;
          } else if (this.student.guardian_mobile && this.student.guardian_mobile.length < 10) {
            this.showErrorMsg('Mobile number should be 10 digits');
            return false;
          } else if (this.student.guardian_whatsapp_number && this.student.guardian_whatsapp_number.length < 10) {
            this.showErrorMsg('Whatsapp number should be 10 digits');
            return false;
          } else if (this.student.guardian_office_contect_number && this.student.guardian_office_contect_number.length < 10) {
            this.showErrorMsg('Office number should be 10 digits');
            return false;
          } else if (this.student.guardian_primary_contect_number && this.student.guardian_primary_contect_number.length < 10) {
            this.showErrorMsg('Primary phone number should be 10 digits');
            return false;
          } else if (this.student.guardian_email && !this.emailRegex.test(this.student.guardian_email)) {
            this.showErrorMsg('Please enter the correct Guardian Email Id.');
            return false;
          }
          break;
        case "CONTACT":
          if (this.student.primary_phone && this.student.primary_phone.length < 10) {
            this.showErrorMsg('Primary number should be manditory with 10 digits');
            return false;
          } else if (this.student.primary_whatsapp && this.student.primary_whatsapp.length < 10) {
            this.showErrorMsg('Whatsapp number should be manditory with 10 digits');
            return false;
          }
          break;
        case "SIBLING":

          break;
        case "SCHOOL":

          break;
        case "TAC": {
          if (!this.student.isAgreeTAC) {
            this.showErrorMsg('Please accept the Tearms and Conditions');
            return false;
          }
          break;
        }
        case "DECLARATION":
          break;
        case "PREVIEW":
          break;
        default: break;
      }
    } catch (err: any) {
      return false;
    }
    return true;
  }

  async next() {
    console.log("Student Details", this.student);
    if (this.isValidForm()) {
      if (this.activeStep.stepIndex == 0) {
        await this.processDocument();
        this.admissionStateStepper.nativeElement.stepNext('success');
        this.activeStep = this.steps[this.activeStep.stepIndex + 1];
        await this.startVoiceFormFilling();
      } else if (this.activeStep.stepIndex == (this.steps.length - 1)) {
        await this.submit();
      } else {
        this.admissionStateStepper.nativeElement.stepNext('success');
        this.activeStep = this.steps[this.activeStep.stepIndex + 1];
        await this.startVoiceFormFilling();
      }
    } else {
      this.admissionStateStepper.nativeElement.stepNext('danger', true);
    }
  }

  async previous() {
    if (this.activeStep.stepIndex != 0) {
      this.admissionStateStepper.nativeElement.stepBack();
      this.activeStep = this.steps[this.activeStep.stepIndex - 1];
      await this.startVoiceFormFilling();
    }
  }

  async processDocument() {
    this.studentDetailsService.showLoader();
    try {
      var documents = this.student.documents;

      if (documents.student_aadhar_frontView && documents.student_aadhar_backView) {
        var studentAadharDetails: any = await this.ocrService.scanAadhar({
          front: documents.student_aadhar_frontView.dataUrl.split("base64,")[1],
          back: documents.student_aadhar_backView.dataUrl.split("base64,")[1]
        });

        if (studentAadharDetails.name && !this.student.first_name) {
          this.student.first_name = studentAadharDetails.first_name;
          this.student.last_name = studentAadharDetails.last_name;
        }
        if (studentAadharDetails.dob && !this.student.dob) {
          this.student.dob = moment(studentAadharDetails.dob, 'DD/MM/YYYY').format("YYYY-MM-DD");
          this.student.age = this.studentDetailsService.calculateAge(this.student.dob);
        }
        if (studentAadharDetails.aadharNumber && !this.student.aadhar_number) {
          this.student.aadhar_number = studentAadharDetails.aadharNumber;
        }
        if (studentAadharDetails.gender && !this.student.gender) {
          this.student.gender = studentAadharDetails.gender == "MALE" ? "M" : "F";
        }
        if (studentAadharDetails.address && !this.student.address) {
          this.student.address = studentAadharDetails.address;
        }
        if (studentAadharDetails.pincode && !this.student.pincode) {
          this.student.pincode = studentAadharDetails.pincode;
        }
      }

      if (this.student.relationType == 'parents') {
        if (documents.father_aadhar_frontView && documents.father_aadhar_backView) {
          var fatherAadharDetails: any = await this.ocrService.scanAadhar({
            front: documents.father_aadhar_frontView.dataUrl.split("base64,")[1],
            back: documents.father_aadhar_backView.dataUrl.split("base64,")[1]
          });
          if (fatherAadharDetails.name && !this.student.father_name) {
            this.student.father_name = fatherAadharDetails.name;
            this.student.father_address = fatherAadharDetails.address || '';
          }
        }

        if (documents.mother_aadhar_frontView && documents.mother_aadhar_backView) {
          var motherAadharDetails: any = await this.ocrService.scanAadhar({
            front: documents.mother_aadhar_frontView.dataUrl.split("base64,")[1],
            back: documents.mother_aadhar_backView.dataUrl.split("base64,")[1]
          });
          if (motherAadharDetails.name && !this.student.mother_name) {
            this.student.mother_name = motherAadharDetails.name;
            this.student.mother_address = motherAadharDetails.address || '';
          }
        }
      } else {
        if (documents.guardian_aadhar_frontView && documents.guardian_aadhar_backView) {
          var gaurdianAadharDetails: any = await this.ocrService.scanAadhar({
            front: documents.guardian_aadhar_frontView.dataUrl.split("base64,")[1],
            back: documents.guardian_aadhar_backView.dataUrl.split("base64,")[1]
          });
          if (gaurdianAadharDetails.name && !this.student.gaurdian_name) {
            this.student.gaurdian_name = gaurdianAadharDetails.name;
            this.student.gaurdian_address = gaurdianAadharDetails.address || '';
          }
        }
      }
    } catch (error: any) {
      console.log(error, 'ERROR');
    }

    this.studentDetailsService.hideLoader();
  }

  async submit() {
    this.studentDetailsService.showLoader();
    try {
      var student = JSON.parse(JSON.stringify(this.student));
      this.dateFieldList.forEach((dateField: any) => {
        if (student[dateField]) student[dateField] = moment(student[dateField]).format('DD/MM/YYYY');
      });

      if (student.schoolHistories.length > 0) {
        student.previous_school = student.schoolHistories[student.schoolHistories.length - 1].last_school_name || '';
      }

      var attachment = [];

      if (isPlatform('capacitor')) {
        const data = document.querySelector("app-preview-data").innerHTML;
        let pdfBase64Content = await this.pdfGenerator.fromData(data, { documentSize: "A4", type: "base64" });

        attachment.push({ type: 'base64', name: `Student-Admission-Form.pdf`, contentType: 'application/pdf', path: pdfBase64Content });
        this.base64Content = attachment[0].path;
      }

      if (student.photo && student.photo.dataUrl) {
        attachment.push({ type: 'base64', name: `Student-Photo.jpeg`, contentType: 'image/jpeg', path: student.photo.dataUrl.split("base64,")[1] });
      }

      var documents = student.documents;

      if (documents.student_aadhar_frontView && documents.student_aadhar_backView) {
        attachment.push({ type: 'base64', name: `AadharCard-FrontView.jpeg`, contentType: 'image/jpeg', path: documents.student_aadhar_frontView.dataUrl.split("base64,")[1] });
        attachment.push({ type: 'base64', name: `AadharCard-BackView.jpeg`, contentType: 'image/jpeg', path: documents.student_aadhar_backView.dataUrl.split("base64,")[1] });
      }

      (documents.medicalReports || []).forEach((document: any, index: number) => {
        attachment.push({ type: 'base64', name: `Medical-Report-${index + 1}.jpeg`, contentType: 'image/jpeg', path: document.dataUrl.split("base64,")[1] });
      });

      (documents.passportOrBirthCertificate || []).forEach((document: any, index: number) => {
        attachment.push({ type: 'base64', name: `Passport-or-Birth-Certificate-${index + 1}.jpeg`, contentType: 'image/jpeg', path: document.dataUrl.split("base64,")[1] });
      });

      (documents.schoolRecord || []).forEach((document: any, index: number) => {
        attachment.push({ type: 'base64', name: `School-Record-${index + 1}.jpeg`, contentType: 'image/jpeg', path: document.dataUrl.split("base64,")[1] });
      });

      if (student.relationType == "parents") {
        if (documents.father_aadhar_frontView && documents.father_aadhar_backView) {
          attachment.push({ type: 'base64', name: `Father-AadharCard-FrontView.jpeg`, contentType: 'image/jpeg', path: documents.father_aadhar_frontView.dataUrl.split("base64,")[1] });
          attachment.push({ type: 'base64', name: `Father-AadharCard-BackView.jpeg`, contentType: 'image/jpeg', path: documents.father_aadhar_backView.dataUrl.split("base64,")[1] });
        }

        if (documents.mother_aadhar_frontView && documents.mother_aadhar_frontView) {
          attachment.push({ type: 'base64', name: `Mother-AadharCard-FrontView.jpeg`, contentType: 'image/jpeg', path: documents.mother_aadhar_frontView.dataUrl.split("base64,")[1] });
          attachment.push({ type: 'base64', name: `Mother-AadharCard-BackView.jpeg`, contentType: 'image/jpeg', path: documents.mother_aadhar_backView.dataUrl.split("base64,")[1] });
        }

        if (student.signature.father) {
          attachment.push({ type: 'base64', name: 'Father-Signature.png', contentType: 'image/jpeg', path: student.signature.father.split("base64,")[1] });
        }
        if (student.signature.mother) {
          attachment.push({ type: 'base64', name: 'Mother-Signature.png', contentType: 'image/jpeg', path: student.signature.mother.split("base64,")[1] });
        }
      } else {
        if (documents.guardian_aadhar_frontView && documents.guardian_aadhar_backView) {
          attachment.push({ type: 'base64', name: `Guardian-AadharCard-FrontView.jpeg`, contentType: 'image/jpeg', path: documents.guardian_aadhar_frontView.dataUrl.split("base64,")[1] });
          attachment.push({ type: 'base64', name: `Guardian-AadharCard-BackView.jpeg`, contentType: 'image/jpeg', path: documents.guardian_aadhar_backView.dataUrl.split("base64,")[1] });
        }
        if (student.signature.guardian) {
          attachment.push({ type: 'base64', name: 'Guardian-Signature.png', contentType: 'image/jpeg', path: student.signature.guardian.split("base64,")[1] });
        }
      }

      if (student.mother_mobile || student.mother_office_contact_number || student.mother_primary_contect_number || student.mother_whatsapp_number) {
        if (student.mother_mobile !== student.mother_primary_contect_number) {
          student.mother_other_mobile = student.mother_primary_contect_number;
        } else if (student.mother_mobile !== student.mother_office_contact_number) {
          student.mother_other_mobile = student.mother_office_contact_number;
        } else {
          student.mother_other_mobile = student.mother_whatsapp_number;
        }
      }

      if (student.father_office_contact_number || student.father_primary_contect_number || student.father_whatsapp_number || student.residence_phone) {
        if (student.residence_phone !== student.father_primary_contect_number) {
          student.father_other_mobile = student.father_primary_contect_number;
        } else if (student.residence_phone !== student.father_office_contact_number) {
          student.father_other_mobile = student.father_office_contact_number;
        } else {
          student.father_other_mobile = student.father_whatsapp_number;
        }
      }

      ['relationType', 'isAgreeTAC', 'photo', 'signature', 'siblings', 'schoolHistories', 'documents', 'gender_display_value', 'standard_display_value', 'curriculum_display_value', 'standard_display_value',
        'transport_status_display_value', 'asthamatic_display_value', 'vision_type_display_value', 'age', 'father_address', 'mother_address', 'father_designation', 'father_whatsapp_number', 'father_office_contact_number', 'father_primary_contect_number', 'mother_designation', 'mother_whatsapp_number',
        'mother_office_contact_number', 'mother_primary_contect_number', 'primary_name', 'primary_relation', 'primary_phone', 'primary_whatsapp'].forEach((key: string) => delete student[key]);

      attachment.unshift({ type: 'base64', name: 'Student-Details.json', contentType: 'application/json', path: btoa(JSON.stringify(student, null, '\t')) });

      let StudentFullName = `${student.first_name || "Test"} ${student.last_name || "test"} [${moment().format("DD-MMM-YYYY HH-mm-ss")}]`;

      this.uploadedFolderDetails = await this.oneDrive.upload(StudentFullName, attachment);
      this.modalPopup();
    } catch (err: any) {
      this.showErrorMsg(err);
    }
    this.studentDetailsService.hideLoader();
  }

  async showErrorMsg(error: any) {
    const alert = await this.alertController.create({
      subHeader: error.message || error,
      cssClass: 'custom-alert-style',
      mode: 'md',
      buttons: [
        {
          text: 'Ok',
          cssClass: 'alert-button-confirm'
        }
      ],
    });

    await alert.present();
  }

  async modalPopup() {
    this.isModuleOpen = true;
    try {
      this.textSpeechRecognitionService.isVoiceEnabled = true;
      await this.textSpeechRecognitionService.speakText('Thank you, your admission process has been completed successfully. Please handover the device to the admin', true);
    } catch (err) {
      console.log("Voice not enabled");
    }
    this.textSpeechRecognitionService.isVoiceEnabled = false;
  }

  async sendStudentDetails() {
    this.textSpeechRecognitionService.isVoiceEnabled = true;
    await this.textSpeechRecognitionService.enableVoice();
    await this.startVoiceFormFilling();
  }

  async voiceStopBtn() {
    this.textSpeechRecognitionService.isVoiceEnabled = false;
    this.textSpeechRecognitionService.disableVoice();
  }

  async startVoiceFormFilling() {
    if (this.textSpeechRecognitionService.isVoiceEnabled) {
      if (this.activeStep.stepIndex == 3) {
        var speechDetails = this.studentDetailsService.speechArray[this.activeStep.stepIndex];
        if (this.student.relationType == "parents") {
          speechDetails.fields = [].concat(speechDetails.father, speechDetails.mother);
        } else {
          speechDetails.fields = [].concat(speechDetails.guardian);
        }
      }
      await this.studentDetailsService.startRecording(this.activeStep.stepIndex);
    }
  }

  async admissionProcess() {
    let auth = await this.storageService.storage.get('ADMIN_LOGIN_PIN');
    try {
      if (!this.userPin) throw 'Please enter Admin password';
      if (this.userPin === auth) {
        this.openInAppBrowserAndEmailer();
      } else {
        throw 'Invalid Admin password';
      }
    } catch (error: any) {
      this.studentDetailsService.presentAlert(error);
    }
  }

  async openInAppBrowserAndEmailer() {
    try {
      this.studentDetailsService.showLoader();
      const studentRegistrationNumber = await this.inAppBrowserService.openInAppBrowser(this.student);
      document.getElementById('hide').hidden = true;
      this.goToHome = true;

      await this.emailComposser.sendEmail(studentRegistrationNumber, this.uploadedFolderDetails, this.student);
    } catch (error) {
      this.studentDetailsService.presentAlert(error);
    }
    this.studentDetailsService.hideLoader();
  }

  backToHome() {
    location.href = '/home';
    this.goToHome = false;
  }



}
