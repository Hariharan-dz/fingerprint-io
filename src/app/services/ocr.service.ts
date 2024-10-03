import { Injectable } from '@angular/core';
import { OCR, OCRSourceType } from '@awesome-cordova-plugins/ocr/ngx';

@Injectable({
  providedIn: 'root'
})
export class OCRService {

  constructor(private ocr: OCR) { }

  async scan(documentBase64: string) {
    return await this.ocr.recText(OCRSourceType.BASE64, documentBase64);
  }

  async scanAadhar(document: any) {
    var aadhar: any = { address: "" };
    var frontDetails = await this.scan(document.front);
    var backDetails = await this.scan(document.back);

    var frontLineText = (frontDetails.lines || {}).linetext || [];
    var backLineText = (backDetails.lines || {}).linetext || [];

    frontLineText.forEach((text: string, index: number) => {
      if (text.match(/^([0-9]{4}) ([0-9]{4}) ([0-9]{4})$/g)) {
        aadhar.aadharNumber = text;
      } else if (text.match(/DOB(:|) ([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/g)) {
        aadhar.dob = text.split("DOB: ")[1] || text.split("DOB ")[1];
        if (!aadhar.name) {
          aadhar.name = frontLineText[index - 1];
        }
      } else if (text.match(/ MALE$/gi)) {
        aadhar.gender = "MALE";
      } else if (text.match(/ FEMALE$/gi)) {
        aadhar.gender = "FEMALE";
      } else if (text.split("Father: ").length == 2) {
        aadhar.fatherName = text.split("Father: ")[1];
        var text1 = frontLineText[index - 1] || '';
        var text2 = frontLineText[index - 2] || '';
        aadhar.name = text1.indexOf(": ") != -1 ? text2 : text1;
      }
    });

    var isAddressTextMatched = false;
    var isAddressFirstLinetMatched = false;
    var addressArray = [];
    backLineText.forEach((text: string, index: number) => {
      if (text.indexOf("Address:") != -1) {
        isAddressTextMatched = true;
        text = text.split("Address:")[1].trim();
      }
      if (isAddressTextMatched) {
        if (text.match(/^(S\/O|D\/O|W\/O|H\/O|C\/O|G\/O|P\/O|SIO|DIO|WIO|HIO|CIO|GIO|PIO): /gi)) {
          if (text.charAt(1) == "I") text = text.replace("I", "/");
          isAddressFirstLinetMatched = true;
        }
      }
      if (isAddressTextMatched && isAddressFirstLinetMatched) {
        addressArray.push(text);
        if (text.match(/ ([0-9]{3} [0-9]{3}|[0-9]{6})$/g)) {
          aadhar.pincode = text.substr(-7).trim().replace(" ", "");
          isAddressTextMatched = isAddressFirstLinetMatched = false;
        }
      }
    });
    aadhar.address = addressArray.join(" ");

    if (aadhar.name) {
      var splitName = aadhar.name.split(" ");
      aadhar.last_name = splitName.pop();
      aadhar.first_name = splitName.join(" ");
    }
    return aadhar;
  }
}
