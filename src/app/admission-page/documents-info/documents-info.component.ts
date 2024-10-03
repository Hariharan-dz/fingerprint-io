import { Component, Input, OnInit } from '@angular/core';
import { PhotoService } from 'src/app/services/photo.service';

@Component({
  selector: 'app-documents-info',
  templateUrl: './documents-info.component.html',
  styleUrls: ['./documents-info.component.scss'],
})
export class DocumentsInfoComponent implements OnInit {
  documentModelView = {
    isModalOpen: false,
    documentSrcValue: ''
  };

  @Input() student: any;
  @Input() documents: any;
  document: any = {
    aadharDoc: {
      type: 'aadharDoc',
    },
    schoolRecord: {
      type: 'schoolRecord',
    },
    passportOrBirthCertificate: {
      type: 'passportOrBirthCertificate'
    },
    medicalReports: {
      type: 'medicalReports'
    }
  };


  constructor(private photoService: PhotoService) { }

  ngOnInit() { }

  async scanDocument(type: any, isSingleFile: boolean = false, test?: any) {
    try {
      if(test) {
        this.documents = test.documents;
      }
      const { dataUrl } = (await this.photoService.takePhoto());
      // const dataUrl = 'data:image/jpeg;base64,' + await this.photoService.scanPhoto();
      if (isSingleFile) {
        this.documents[type] = { dataUrl: dataUrl };
      } else {
        this.documents[type] = this.documents[type] || [];
        this.documents[type].push({ dataUrl: dataUrl });
      }
    } catch (error) {
      console.error('Error scanning document:', error);
    }
  }

  deleteDoc(type: any, index: number = null) {
    if(this.documents[type] instanceof Array){
      this.documents[type].splice(index, 1);
      if(this.documents[type].length == 0) delete this.documents[type];
    }else{
      delete this.documents[type];
    }
  }

  showDocumentModel(type: any, index: any = null) {
    if(this.documents[type] instanceof Array){
      this.documentModelView.documentSrcValue = this.documents[type][index].dataUrl;
    }else{
      this.documentModelView.documentSrcValue = this.documents[type].dataUrl;
    }
    this.documentModelView.isModalOpen = true;
  }
}
