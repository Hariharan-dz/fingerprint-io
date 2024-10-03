import { Injectable } from '@angular/core';

import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

import { ModalController } from '@ionic/angular';
import { ModalSelectManuallyComponent } from '../admission-page/modal-select-manually/modal-select-manually.component';

@Injectable({
  providedIn: 'root'
})
export class TextSpeechRecognitionService {

  selectedValue: any;
  isVoiceEnabled: boolean = false;

  constructor(private modalController: ModalController) {
    SpeechRecognition.requestPermission();
  }

  async enableVoice() {
    const { available } = await SpeechRecognition.available();
    if (available) {
      this.isVoiceEnabled = true;
    } else {
      // alert("Voice not enabled");
    }
  }

  async disableVoice() {
    this.isVoiceEnabled = false;
    await SpeechRecognition.stop();
  }

  async speakText(text: string, isRetry: any = false) {
    if (!this.isVoiceEnabled) throw { message: "Voice Not Enabled", code: 1001 };
    try {
      return await TextToSpeech.speak({
        text: text,
        lang: 'en-US', //ta-IN, te-IN, kn-IN
        rate: 1.0,
        pitch: 1.0, //0.5 - 2.0 - Increase 0.5
        volume: 1.0,
        category: 'ambient'
      });
    } catch (error) {
      console.log("Catch block", error);
      if (!isRetry) {
        this.speakText(text, true);
      }
    }
  }

  async startListen(isYesOrNo: boolean, count: number = 0) {
    this.isVoiceEnabled = true;
    var result: any;
    if (!this.isVoiceEnabled) throw "Voice data not enabled";
    try {
      result = await SpeechRecognition.start({
        popup: false,
        partialResults: false,
        language: 'en-US',
      });
      return result.matches[0].toLowerCase();
    } catch (error) {
      count++;
      console.log("catch error", error);
      if (!this.isVoiceEnabled) throw { message: "Voice Not Enabled", code: 1000 };
      if (count < 2) {
        await this.speakText('Try again');
        return this.startListen(isYesOrNo, count);
      } else if(isYesOrNo){
        return await this.voiceNotRecogSelectManually();
      }
      return null;
    }
  }

  async speakAndListen(text: string, isYesOrNo: boolean) {
    await this.speakText(text);
    return await this.startListen(isYesOrNo);
  }

  async choosedValue(event: any) {
    this.selectedValue = event.detail.value;
    this.modalController.dismiss(this.selectedValue);
  }

  async voiceNotRecogSelectManually() {
    return new Promise(async (resolve, reject) => {
      const modal = await this.modalController.create({
        component: ModalSelectManuallyComponent
      });

      modal.onDidDismiss().then((result) => {
        console.log(result, 'res');
        const selectedValue = result.data;
        console.log('Selected value:', selectedValue);
        resolve(selectedValue);
      });
      await modal.present();
    })
  }

}
