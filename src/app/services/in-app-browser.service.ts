import { Injectable } from '@angular/core';
import { InAppBrowser, InAppBrowserObject, InAppBrowserOptions } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode/ngx';
import { StorageService } from './storage.service';
import { StudentDetailsService } from './student-details.service';

@Injectable({
  providedIn: 'root'
})
export class InAppBrowserService {

  constructor(private inAppBrowser: InAppBrowser, private storageService: StorageService, 
    private backgroundMode: BackgroundMode, private studentDetailsService: StudentDetailsService) { }

  async openInAppBrowser(student: any): Promise<number> {
    return new Promise<number>(async (resolve, reject) => {
      let isDeveloperModeEnabled = (await this.storageService.storage.get("IS_DEVELOPER_OPTIONS_ENABLED")) == "TRUE";
      let ERP_ADMISSION_APP_URL = await this.storageService.storage.get("ERP_ADMISSION_APP_URL");
      let ERP_ADMISSION_ADD_STUDENT_URL = await this.storageService.storage.get("ERP_ADMISSION_ADD_STUDENT_URL");
      let ERP_ADMISSION_APP_USERNAME = await this.storageService.storage.get("ERP_ADMISSION_APP_USERNAME");
      let ERP_ADMISSION_APP_PASSWORD = await this.storageService.storage.get("ERP_ADMISSION_APP_PASSWORD");
      var studentRegistrationNumber: string = null;
      var isStudentCreated: boolean = false;

      let options: InAppBrowserOptions = {};
      if (!isDeveloperModeEnabled) {
        this.backgroundMode.enable();
        options.hidden = "yes";
      }

      const browser: InAppBrowserObject = this.inAppBrowser.create(ERP_ADMISSION_APP_URL, '_blank', options);

      if (!isDeveloperModeEnabled) {
        var timer = setTimeout(() => {
          browser.close();
          reject("Timeout Error");
        }, 60 * 1000);
      }

      browser.on('exit').subscribe((data: any) => {
        clearTimeout(timer);
      });

      browser.on('loadstop').subscribe((data: any) => {
        var type = "";
        if(data.url == ERP_ADMISSION_APP_URL){
          type = "LOGIN";
        }else if (data.url.startsWith(ERP_ADMISSION_APP_URL)) {
          browser.close();
          reject("ERP Tool Login Failed");
          return;
        } else if (data.url.endsWith('dashboard.php')) {
          type = "REDIRECT_ADD_STUDENT";
        } else if (data.url == ERP_ADMISSION_ADD_STUDENT_URL) {
          if (isStudentCreated) {
            type = "GET_PREVIOUS_REGISTRATION_NUMBER";
          } else {
            type = "CREATE_STUDENT";
          }
        } else if (isStudentCreated) {
          type = "REDIRECT_ADD_STUDENT";
        }
        const jsCode = `
          const type = "${type}";
          const isDebugEnabled = ${isDeveloperModeEnabled};
          const credential = {
            username: "${ERP_ADMISSION_APP_USERNAME}",
            password: "${ERP_ADMISSION_APP_PASSWORD}"
          };
          const addStudentURL = "${ERP_ADMISSION_ADD_STUDENT_URL}";
          const studentDetails = ${JSON.stringify(student)};

          var admission = {
            pause: async (timeout) => {
              return new Promise(async (resolve, reject) => {
                setTimeout(() => resolve(true), timeout);
              });
            },
            triggerClick: async (selector) => {
              var element = document.querySelector(selector);
              if (element) element.click();
            },
            setValueToTextbox: async (selector, value) => {
              var element = document.querySelector(selector);
              if (element) {
                element.value = value;
                if (element.classList.contains("calendar-input")) {
                  element.dispatchEvent(new Event('focus', { bubbles: true }));
                  await admission.pause(500);
                  document.querySelector(".ui-datepicker .ui-state-active").click();
                }else if(element.tagName == "SELECT"){
                  element.dispatchEvent(new Event('change', { bubbles: true }));
              }
              } else {
                console.log(selector, value);
              }
            },
            init: () => {
              if (type == "LOGIN") {
                admission.login();
              } else if (type == "REDIRECT_ADD_STUDENT") {
                admission.redirect(addStudentURL);
              } else if (type == "CREATE_STUDENT") {
                admission.createStudent();
                return admission.getRegistrationNumber();
              } else if (type == "GET_PREVIOUS_REGISTRATION_NUMBER") {
                return admission.getPreviousRegistrationNumber();
              }
            },
            login: async () => {
              await admission.setValueToTextbox('form[id="login-form"] input[name="username"]', credential.username);
              await admission.setValueToTextbox('form[id="login-form"] input[name="pwd"]', credential.password);
              await admission.pause(250);
              await admission.triggerClick('form[id="login-form"] button');
              await admission.pause(500);
            },
            redirect: async (url) => {
              location.href = url;
            },
            createStudent: async () => {
              const keys = Object.keys(studentDetails);
              for (var i = 0; i < keys.length; i++) {
                const key = keys[i];
                const value = studentDetails[key];
                await admission.setValueToTextbox('form[id="myForm1"] [name="' + key + '"]', value);
              };
            
              const sectionElement = document.querySelector('form[id="myForm1"] select[name="class_id"]');
              await admission.pause(1000);
              if(sectionElement && sectionElement.options[1]){
                sectionElement.value = sectionElement.options[1].value;
              }
              
              if(!isDebugEnabled){
                const submitButton = document.querySelector('form[id="myForm1"] [name="update_student"]');
                //submitButton.click();
              }
            },
            getRegistrationNumber: () => {
              return document.querySelector('form[id="myForm1"] [name="student_reg_id"]').value;
            },
            getPreviousRegistrationNumber: () => {
              return document.querySelector('form[id="myForm1"] h2 b').innerText;
            }
          }
          admission.init();
        `;
        browser.executeScript({ code: jsCode }).then((data) => {
          if (type == "CREATE_STUDENT") {
            isStudentCreated = true;
            studentRegistrationNumber = data[0];
          } else if (type == "GET_PREVIOUS_REGISTRATION_NUMBER") {
            if (studentRegistrationNumber == data[0]) {
              browser.close();
              resolve(Number(studentRegistrationNumber));
            } else {
              reject("Student Not Registered Succsfully");
            }
          }
        });
      });
    });
  }
}
