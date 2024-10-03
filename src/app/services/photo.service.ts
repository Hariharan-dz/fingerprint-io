import { Injectable } from '@angular/core';
import { Camera, CameraDirection, CameraResultType, CameraSource } from '@capacitor/camera';
import { DocumentScanner } from '@ionic-native/document-scanner/ngx';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  constructor(private documentScanner: DocumentScanner) { }

  public async takePhoto() {
    // Take a photo
    return await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      direction: CameraDirection.Rear,
      quality: 50,
      allowEditing: true
    });
  }

  public async scanPhoto() {
    return await this.documentScanner.scanDoc({
      sourceType: 1, // 1 = Camera, 0 = Gallery
      fileName: 'my-document.jpg',
      quality: 100,
      returnBase64: true
    });
  }

}
