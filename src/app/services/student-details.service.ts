import { Injectable } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

import * as moment from 'moment';
import { TextSpeechRecognitionService } from './text-speech-recognition.service';

import { KeepAwake } from '@capacitor-community/keep-awake';

@Injectable({
  providedIn: 'root'
})

export class StudentDetailsService {
  isLoaderDismissed: any;
  student: any;
  modalPopupText: any;
  speechArray: any;

  constructor(private toastController: ToastController, private loadingCtrl: LoadingController,
    private textSpeechRecog: TextSpeechRecognitionService, private alertController: AlertController) { }

  formatDOB(refObj: any, text: string) {
    var textSplit = text.split(" ");
    var year, month, date;
    if (textSplit.length == 3) {
      textSplit.forEach((data: any) => {
        if (data.match(/^([0-9]{4})$/g)) {
          year = data;
        } else if (data.match(/^(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/g)) {
          month = data;
        } else if (data.match(/^(first|second|third|[0-9]{1,2})$/g)) {
          var details = { first: "01", second: "02", third: "03" };
          date = details[data] || data;
        }
      });
      if (year && month && date) {
        return moment(`${date}/${month}/${year}`).format('YYYY-MM-DD');
      }
    }
    return null;
  }

  bloodGroup(refObj: any, text: string) {
    var wordSplit = text.split(" ");
    var first = '';
    var second = '';

    if (wordSplit.length === 2) {
      var bloodGroupRegex = /^(oh|Oh|o|O|A|a|AH|Ah|B|b|Be|be|BE|AB|ab|A1|a1)$/;
      var posNegRegex = /^(positive|negative|POSITIVE|NEGATIVE)$/;

      if (bloodGroupRegex.test(wordSplit[0])) {
        var details = {
          oh: 'O', Oh: 'O', o: 'O', O: 'O',
          A: 'A', a: 'A', AH: 'A', ah: 'A',
          B: 'B', b: 'B', Be: 'B', be: 'B', BE: 'B',
          AB: 'AB', ab: 'AB', A1: 'A1', a1: 'A1'
        };
        first = details[wordSplit[0]];
      }

      if (posNegRegex.test(wordSplit[1])) {
        var deta = { positive: '+', negative: '-', NEGATIVE: '-', POSITIVE: '+' };
        second = deta[wordSplit[1].toLowerCase()];
      }
    } else {
      return text;
    }
    return first + ' ' + second;

  }

  formatEmail(refObj: any, text: string) {
    var emailTxt;
    if (!text.includes('@')) {
      emailTxt = text.replace(" at the rate of ", "@").replace(" at ", "@").split(" ").join("");
    }
    emailTxt = text.split(" ").join('');

    return emailTxt;
  }

  processYesOrNo(refObj: any, data: any) {
    if (data === 'yes') return 'yes';
    else if (data === 'no') return 'no';
    return null;
  }

  init(studentObj: any) {
    this.student = studentObj;
    this.speechArray = [
      {},
      {
        page: "Student Details Page",
        refObj: this.student,
        isArray: false,
        fields: [
          { text: 'Student First Name', scopeKey: 'first_name', selector: 'input[name="first_name"]' },
          { text: 'Student Last Name', scopeKey: 'last_name', selector: 'input[name="last_name"]' },
          { text: 'Student Date of Birth', scopeKey: 'dob', selector: 'input[name="dob"]', processData: this.formatDOB },
          {
            text: 'Gender', scopeKey: 'gender', selector: 'ion-select[name="gender"]',
            processData: (refObj: any, data: any) => {
              if (data === 'male' || data === 'mail') return 'M';
              else if (data === 'female') {
                refObj.bus_pickup = '';
                return 'F';
              }
              return null;
            }
          },
          { text: 'Place of Birth', scopeKey: 'birth_place', selector: 'input[name="birth_place"]' },
          { text: 'Aadhar Number', scopeKey: 'aadhar_number', selector: 'input[name="aadhar_number"]' },
          { text: 'Nationality', scopeKey: 'nationality', selector: 'input[name="nationality"]' },
          { text: 'Religion', scopeKey: 'religion', selector: 'input[name="religion"]' },
          { text: 'Caste', scopeKey: 'caste', selector: 'input[name="caste"]' },
          { text: 'OBC/SC/ST/Others', scopeKey: 'sub_caste', selector: 'input[name="sub_caste"]' },
          { text: 'Blood Group', scopeKey: 'blood_group', selector: 'input[name="blood_group"]', processData: this.bloodGroup },
          { text: 'Admission for class/standard', scopeKey: 'standard', selector: 'ion-select[name="master_class_id"]', type: 'STANDARD' },
          { text: 'Mother Tongue', scopeKey: 'mother_tongue', selector: 'input[name="mother_tongue"]' },
          { text: 'Other Languages Known', scopeKey: 'languages', selector: 'input[name="languages"]' },
          {
            text: 'Do you need Bus Transportation? Please answer yes or no', scopeKey: 'transport_status', selector: 'ion-select[name="transport_status"]', isYesOrNo: true,
            processData: (refObj: any, data: any) => {
              if (data === 'yes') return '1';
              else if (data === 'no') {
                refObj.bus_pickup = '';
                return '2';
              }
              return null;
            }
          },
          {
            text: 'Preferred Bus pickup point', scopeKey: 'bus_pickup', selector: 'input[name="bus_pickup"]',
            validateSkip: (refObj: any) => {
              return refObj.transport_status != 1;
            }
          },
          { text: 'Address', scopeKey: 'residence_address', selector: 'textarea[name="residence_address"]' },
          { text: 'Pincode', scopeKey: 'pincode', selector: 'input[name="pincode"]' },
          { text: 'Kindly validate and click on the next button to proceed further', type: "NEXT_SCREEN" }
        ]
      },
      {
        page: "Student Health Details Page",
        refObj: this.student,
        isArray: false,
        fields: [
          {
            text: 'Is the child Asthamatic ?', scopeKey: 'asthamatic', selector: 'ion-select[name="asthamatic"]', isYesOrNo: true,
            processData: (refObj: any, data: any) => {
              if (data == 'yes') return '1';
              else if (data == 'no') return '2'
              return null;
            }
          },
          { text: 'Allergies on any Medicine?', scopeKey: 'allergies_medicine', selector: 'input[name="allergies_medicine"]' },
          { text: 'Allergies on any Food?', scopeKey: 'allergies_food', selector: 'input[name="allergies_food"]' },
          {
            text: 'Do you have any Vision issue? please answer negative or positive', scopeKey: 'vision_type', selector: 'ion-select[name="vision_type"]',
            processData: (refObj: any, data: any) => {
              if (data == 'negative') return '1';
              if (data == 'positive') return '2';
              return null;
            }
          },
          { text: 'Any other medical ailments ?', scopeKey: 'physical_ailment', selector: 'input[name="physical_ailment"]' },
          { text: 'Allergies to change drinking water ?', scopeKey: 'allergic_to_water', selector: 'input[name="allergic_to_water"]' },
          { text: 'Family Doctor or Pediatrician Name ?', scopeKey: 'doctor_name', selector: 'input[name="doctor_name"]' },
          { text: 'Doctor or Pediatrician phone number ?', scopeKey: 'doctor_number', selector: 'input[name="doctor_number"]' },
          { text: 'Hospital address ?', scopeKey: 'clinic_address', selector: 'input[name="clinic_address"]' },
          { text: 'Any childhood diseases ?', scopeKey: 'childhood_diseases', selector: 'input[name="childhood_diseases"]' },
          { text: 'Any physical handicap or disability ?', scopeKey: 'disability', selector: 'input[name="disability"]' },
          { text: 'Is child undergoing any treatments ?', scopeKey: 'cavities_braces', selector: 'input[name="cavities_braces"]' },
          { text: 'Kindly validate and click on the next button to proceed further', type: "NEXT_SCREEN" }
        ]
      },
      {
        page: "Parent/Guardian Information Page",
        refObj: this.student,
        isArray: false,
        fields: [],
        father: [
          { text: 'Father First Name', scopeKey: 'father_first_name', selector: 'input[name="father_first_name"]' },
          { text: 'Father Last Name', scopeKey: 'father_last_name', selector: 'input[name="father_last_name"]' },
          { text: 'Father Address', scopeKey: 'father_address', selector: 'textarea[name="father_qualification"]' },
          { text: 'Father Qualification', scopeKey: 'father_qualification', selector: 'input[name="father_qualification"]' },
          { text: 'Father Occupation', scopeKey: 'father_occupation', selector: 'input[name="father_occupation"]' },
          { text: 'Father Organisation or Company Name', scopeKey: 'father_org', selector: 'input[name="father_org"]' },
          { text: 'Father Designation', scopeKey: 'father_designation', selector: 'input[name="father_designation"]' },
          { text: 'Father Mobile Number', scopeKey: 'residence_phone', selector: 'input[name="residence_phone"]', isNumber: true },
          { text: 'Father Whatsapp Number', scopeKey: 'father_whatsapp_number', selector: 'input[name="father_whatsapp_number"]', isNumber: true },
          { text: 'Father Email ID', scopeKey: 'parent_email', selector: 'input[name="parent_email"]', processData: this.formatEmail },
          { text: 'Father Annual Income in Rupee', scopeKey: 'parent_income', selector: 'input[name="parent_income"]' },
          { text: 'Father Office contact number', scopeKey: 'father_office_contact_number', selector: 'input[name="father_office_contact_number"]', isNumber: true },
          { text: 'Father Primary contact number', scopeKey: 'father_primary_contect_number', selector: 'input[name="father_primary_contect_number"]', isNumber: true },
        ],
        mother: [
          { text: 'Mother First Name', scopeKey: 'mother_first_name', selector: 'input[name="mother_first_name"]' },
          { text: 'Mother Last Name', scopeKey: 'mother_last_name', selector: 'input[name="mother_last_name"]' },
          { text: 'Address', scopeKey: 'mother_address', selector: 'textarea[name="mother_address"]' },
          { text: 'Mother Qualification', scopeKey: 'mother_qualification', selector: 'input[name="mother_qualification"]' },
          { text: 'Mother Occupation', scopeKey: 'mother_occupation', selector: 'input[name="mother_occupation"]' },
          { text: 'Mother Organisation or Company Name', scopeKey: 'mother_org', selector: 'input[name="mother_org"]' },
          { text: 'Mother Designation', scopeKey: 'mother_designation', selector: 'input[name="mother_designation"]' },
          { text: 'Mother Mobile Number', scopeKey: 'mother_mobile', selector: 'input[name="mother_mobile"]', isNumber: true },
          { text: 'Mother Whatsapp Number', scopeKey: 'mother_whatsapp_number', selector: 'input[name="mother_whatsapp_number"]', isNumber: true },
          { text: 'Mother Email ID', scopeKey: 'mother_email', selector: 'input[name="mother_email"]', processData: this.formatEmail },
          { text: 'Mother Annual Income in Rupee', scopeKey: 'mother_income', selector: 'input[name="mother_income"]' },
          { text: 'Mother Office contact number', scopeKey: 'mother_office_contact_number', selector: 'input[name="mother_office_contact_number"]', isNumber: true },
          { text: 'Mother Primary contact number', scopeKey: 'mother_primary_contect_number', selector: 'input[name="mother_primary_contect_number"]', isNumber: true },
          { text: 'Kindly validate and click on the next button to proceed further', type: "NEXT_SCREEN" }
        ],
        guardian: [
          { text: 'Guardian First Name', scopeKey: 'guardian_first_name', selector: 'input[name="guardian_first_name"]' },
          { text: 'Guardian Last Name', scopeKey: 'guardian_last_name', selector: 'input[name="guardian_last_name"]' },
          { text: 'Address', scopeKey: 'guardian_address', selector: 'textarea[name="guardian_address"]' },
          { text: 'Guardian Qualification', scopeKey: 'guardian_qualification', selector: 'input[name="guardian_qualification"]' },
          { text: 'Guardian Occupation', scopeKey: 'guardian_occupation', selector: 'input[name="guardian_occupation"]' },
          { text: 'Guardian Organisation or Company Name', scopeKey: 'guardian_org', selector: 'input[name="guardian_org"]' },
          { text: 'Guardian Designation', scopeKey: 'guardian_designation', selector: 'input[name="guardian_designation"]' },
          { text: 'Guardian Mobile Number', scopeKey: 'guardian_mobile', selector: 'input[name="guardian_mobile"]', isNumber: true },
          { text: 'Guardian Whatsapp Number', scopeKey: 'guardian_whatsapp_number', selector: 'input[name="guardian_whatsapp_number"]', isNumber: true },
          { text: 'Guardian Email ID', scopeKey: 'guardian_email', selector: 'input[name="guardian_email"]', processData: this.formatEmail },
          { text: 'Guardian Annual Income in Rupee', scopeKey: 'guardian_income', selector: 'input[name="guardian_income"]' },
          { text: 'Guardian Office contact number', scopeKey: 'guardian_office_contect_number', selector: 'input[name="guardian_office_contect_number"]', isNumber: true },
          { text: 'Guardian Primary contact number', scopeKey: 'guardian_primary_contect_number', selector: 'input[name="guardian_primary_contect_number"]', isNumber: true },
          { text: 'Kindly validate and click on the next button to proceed further', type: "NEXT_SCREEN" }
        ]
      },
      {
        page: "Emergency Contact Details Page",
        refObj: this.student,
        isArray: false,
        fields: [
          { text: 'Emergency primary contact member Full Name', scopeKey: 'primary_name', selector: 'input[name="primary_name"]' },
          { text: 'relationship to the child', scopeKey: 'primary_relation', selector: 'input[name="primary_relation"]' },
          { text: 'Phone number', scopeKey: 'primary_phone', selector: 'input[name="primary_phone"]', isNumber: true },
          { text: 'Whatsapp number', scopeKey: 'primary_whatsapp', selector: 'input[name="primary_whatsapp"]', isNumber: true },

          { text: 'Emergency secondary contact member Full Name', scopeKey: 'secondary_name', selector: 'input[name="secondary_name"]' },
          { text: 'relationship to the child', scopeKey: 'secondary_relation', selector: 'input[name="secondary_relation"]' },
          { text: 'Phone number', scopeKey: 'secondary_phone', selector: 'input[name="secondary_phone"]', isNumber: true },
          { text: 'Whatsapp number', scopeKey: 'secondary_whatsapp', selector: 'input[name="secondary_whatsapp"]', isNumber: true },

          { text: 'Emergency Third contact member Full Name', scopeKey: 'ternery_name', selector: 'input[name="ternery_name"]' },
          { text: 'relationship to the child', scopeKey: 'ternery_relation', selector: 'input[name="ternery_relation"]' },
          { text: 'Phone number', scopeKey: 'ternery_phone', selector: 'input[name="ternery_phone"]', isNumber: true },
          { text: 'Whatsapp number', scopeKey: 'ternery_whatsapp', selector: 'input[name="ternery_whatsapp"]', isNumber: true },

          { text: 'Kindly validate and click on the next button to proceed further', type: "NEXT_SCREEN" }
        ]
      },
      {
        page: "Sibling Details Page",
        refObj: this.student.siblings,
        isArray: true,
        fields: [
          { text: 'Sibling First Name', scopeKey: 'first_name', selector: 'input[name="sibling_first_name"]' },
          { text: 'Sibling Middle Name', scopeKey: 'middle_name', selector: 'input[name="sibling_middle_name"]' },
          { text: 'Sibling Last Name', scopeKey: 'last_name', selector: 'input[name="sibling_last_name"]' },
          {
            text: 'Gender', scopeKey: 'gender', selector: 'ion-select[name="sibling_gender"]',
            processData: (refObj: any, data: any) => {
              if (data == 'male' || data == 'mail') return 'M';
              if (data == 'female') return 'F';
              return null;
            }
          },
          {
            text: 'Date of Birth', scopeKey: 'dob', selector: 'input[name="sibling_dob"]',
            processData: this.formatDOB
          },
          { text: 'Current school', scopeKey: 'current_school', selector: 'input[name="sibling_current_school"]' },
          { text: 'Current class or Grade', scopeKey: 'current_class', selector: 'input[name="sibling_current_class"]' },
          { text: 'Do you have any other sibling?', isAddAdditionalRecord: true, processData: this.processYesOrNo },
          { text: 'Kindly validate and click on the next button to proceed further', type: "NEXT_SCREEN" }
        ]
      },
      {
        page: "School History Page",
        refObj: this.student.schoolHistories,
        isArray: true,
        fields: [
          { text: 'Your Previous School Name?', scopeKey: 'school_name', selector: 'input[name="last_school_name"]' },
          { text: 'Place of the school', scopeKey: 'school_place', selector: 'input[name="last_school_place"]' },
          {
            text: 'Curriculum', scopeKey: 'curriculum', selector: 'ion-select[name="curriculum"]',
            processData: (refObj: any, data: any) => {
              if (data == 'CBSE' || data == 'cbse') {
                refObj.curriculum = 'cbse';
              } else if (data == 'state' || data == 'state board') {
                refObj.curriculum = 'state';
              } else {
                refObj.curriculum = 'other';
              };
            }
          },
          { text: 'Language of instructions', scopeKey: 'language_of_instruction', selector: 'input[name="last_school_language_of_instruction"]' },
          { text: 'From Date', scopeKey: 'from_date', selector: 'input[name="last_school_from_date"]', processData: this.formatDOB },
          { text: 'To Date', scopeKey: 'to_date', selector: 'input[name="last_school_to_date"]', processData: this.formatDOB },
          { text: 'Last class or Grade', scopeKey: 'last_class', selector: 'input[name="last_class"]' },
          { text: 'Reason for leaving', scopeKey: 'reason_for_leaving', selector: 'input[name="reason_for_leaving"]' },
          { text: 'Studied any other addition school?', isAddAdditionalRecord: true, processData: this.processYesOrNo },
          { text: 'Kindly validate and click on the next button to proceed further', type: "NEXT_SCREEN" }
        ]
      },
      {
        page: "Terms and Condition Page",
        refObj: this.student,
        isArray: false,
        fields: [
          { text: 'Please read and accept Terms and Conditions and then click on next button', type: 'TAC_CHECKBOX' },
          { text: 'Kindly validate and click on the next button to proceed further', type: 'NEXT_SCREEN' }
        ]
      },
      {
        page: "Declaration Page",
        refObj: this.student,
        isArray: false,
        fields: [
          { text: 'Please read and do signatures and click on next button', type: 'DECLARATION_PAGE' }
        ]
      },
      {
        page: "Preview Page",
        refObj: this.student,
        isArray: false,
        fields: [
          { text: 'Please preview the details filled and click on submit button to proceed further', type: 'PREVIEW_PAGE' }
        ]
      }
    ];
  }

  async startRecording(activeStepIndex: number, fieldIndex: number = 0) {
    try {
      var { isArray, refObj: parentRefObj, fields } = this.speechArray[activeStepIndex];

      var loopCount = 0;
      for (let j = fieldIndex; j < fields.length; j++) {
        var { text, scopeKey, isAddAdditionalRecord, selector, refObj, processData, validateSkip, type, isYesOrNo, isNumber } = fields[j];
        this.modalPopupText = text;
        refObj = refObj || parentRefObj;

        var parentList = [];
        if (isArray) {
          // console.log(refObj, 'Initial Ref object');
          parentList = refObj;
          // console.log(parentList, 'PARENT LIST');
          refObj = refObj[loopCount];
          // console.log(refObj, 'REF OBJ');
        }

        //Scroll the Dom element into the screen
        if (selector) {
          const element = document.querySelectorAll(selector) as any;
          if (element.length > 0) {
            if (isArray) element[loopCount].scrollIntoViewIfNeeded();
            else element[0].scrollIntoViewIfNeeded();
          } else {
            // alert("Invalid Selector " + selector);
          }
        } else {
          // alert("Selector not configured");
        }

        //Validate is this field already have data
        if (scopeKey && refObj[scopeKey]) continue;

        //Skip this field based on condition
        if (validateSkip && validateSkip(refObj)) continue;
        if (isAddAdditionalRecord && parentList.length != (loopCount + 1)) {
          loopCount++;
          j = -1;
          continue;
        }

        if (type == 'STANDARD') {
          continue;
        }

        if (type == 'NEXT_SCREEN' || type == 'TAC_CHECKBOX' || type == 'DECLARATION_PAGE' || type == 'PREVIEW_PAGE') {
          await this.textSpeechRecog.speakText(text);
          break;
        }

        // while (true) {
        //Speak and get answer by listening
        var result = await this.textSpeechRecog.speakAndListen(text, isYesOrNo);
        text = "Please try again";

        //to remove white space inbtween for mobile/contact numbers
        if (isNumber) {
          if (result) {
            result = result.replace(/\s+/g, '').split('').join('');
          }
        }

        //To get the YES word
        if (result == 'yes please' || result == 'yes continue') {
          result = result.split(' ')[0];
        }

        //If user want to skip the particular field
        if (result === 'skip') continue;

        //validate result
        if (processData) result = processData(refObj, result);

        if (result != null) {
          if (isAddAdditionalRecord) {
            if (result == "yes") {
              parentList.push({});
              await this.pause(1000);
              loopCount++;
              j = -1;
            }
          } else refObj[scopeKey] = this.capatilize(result, true);
          // break;
        };
        // }

        if (type == 'NEXT_SCREEN') {
          if (['yes', 'okay', 'proceed'].indexOf(result.split(' ')[0]) != -1) {
            await this.next();
          } else {
            // throw { message: 'STOP_LISTEN' }
          }
        }
      }

    } catch (err: any) {
      console.error(err.message);
      // if (err.message == 'STOP_LISTEN') {
      //   this.textSpeechRecog.disableVoice();
      // } else {
      //    alert(err.message);
      // }
    }
  }

  pause(timeoutInMs: number) {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(true), timeoutInMs);
    });
  }

  async next() {
    var nextBtnDom: any = document.querySelector("ion-footer ion-button.nxt-btns");
    nextBtnDom.click();
    await this.pause(2000);
  }

  async previous() {
    var previousBtnDom: any = document.querySelector("ion-footer ion-button.back-button");
    previousBtnDom.click();
    await this.pause(2000);
  }

  capatilize(result: string, allWord: boolean = false) {
    if (allWord) {
      return result.split(" ").map((text: string) => text.charAt(0).toUpperCase() + text.substring(1)).join(" ");
    } else {
      return result.charAt(0).toUpperCase() + result.substring(1);
    }
  }

  // ===========================

  getDropDownText(event: any) {
    const target: any = event.target;
    const selectOption: any = target.querySelector(`ion-select-option[value="${target.value}"]`);
    return selectOption ? selectOption.innerText : '';
  }

  calculateAge(dob: any) {
    var months = moment().diff(moment(dob), 'months');
    var numberOfYears = Math.floor(months / 12);
    var numberOfMonths = months % 12;

    return `${numberOfYears} ${numberOfYears > 1 ? 'Years' : 'Year'}, ${numberOfMonths} ${numberOfMonths > 1 ? 'Months' : 'Month'}`
  }

  toster = {
    success: (message: string) => {
      this.toster.show('SUCCESS', message);
    },
    error: (message: any) => {
      this.toster.show('ERROR', message);
    },
    show: async (type: string, message: any) => {
      const toast = await this.toastController.create({
        message: message,
        duration: 2000,
        icon: type == 'SUCCESS' ? 'checkmark-outline' : 'close-outline',
        cssClass: type == 'SUCCESS' ? 'toaster-style' : 'cancel-toaster-style',
        position: 'bottom',
      });
      await toast.present();
    }
  }

  async showLoader() {
    this.isLoaderDismissed = false;
    const loader = await this.loadingCtrl.create({
      message: 'Please wait...',
      spinner: 'lines-sharp',
      cssClass: 'ion-loading-class',
      translucent: true
    });
    if (!this.isLoaderDismissed && !(await this.loadingCtrl.getTop())) {
      await loader.present();
    }
  }

  async hideLoader() {
    try {
      this.isLoaderDismissed = true;
      if (await this.loadingCtrl.getTop()) {
        await this.loadingCtrl.dismiss();
      }
    } catch (e) {
      console.log(e);
    }
  }

  async autoLockDisable() {
    await KeepAwake.keepAwake();
  }

  //not used (may be in future if needed)
  async autoLockenable() {
    await KeepAwake.allowSleep();
  }


  async presentAlert(errMsg: any) {
    const alert = await this.alertController.create({
      header: errMsg.message || errMsg,
      buttons: ['OK'],
    });

    await alert.present();
  }

}
