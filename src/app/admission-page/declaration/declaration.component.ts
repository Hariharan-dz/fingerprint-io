import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { SignaturePad } from 'angular2-signaturepad';

@Component({
  selector: 'app-declaration',
  templateUrl: './declaration.component.html',
  styleUrls: ['./declaration.component.scss'],
})
export class DeclarationComponent implements OnInit {
  @Input() signature: any;
  @Input() student: any;

  @ViewChild('father') father: SignaturePad;
  @ViewChild('mother') mother: SignaturePad;
  @ViewChild('guardian') guardian: SignaturePad;

  public signaturePadOptions: any = {
    'minWidth': 1,
    'canvasWidth': window.innerWidth - 90,
    'canvasHeight': 180
  };

  date: any = new Date().toLocaleDateString();

  constructor() { }

  ngOnInit() { }

  ionViewWillEnter() { }

  ngAfterViewInit() {
    const signatureTypes = this.student.relationType === 'parents' ? ['father', 'mother'] : ['guardian'];
    this.signaturePreview(signatureTypes);
  }

  drawClear(type: string) {
    switch (type) {
      case 'father': this.father.clear();
        break;
      case 'mother': this.mother.clear();
        break;
      case 'guardian': this.guardian.clear();
        break;
    };
    delete this.signature[type];
  }

  drawStart(event: any) {
    console.log('Start drawing', event);
  }

  drawComplete(type: any, ref: any) {
    const dataUrl = ref.toDataURL('image/png');
    this.setSignature(type, dataUrl);
  }

  setSignature(type: string, data: string) {
    this.signature[type] = data;
  }

  getSignature(type: string): string {
    return this.signature[type];
  }

  signaturePreview(typeList: any) {
    typeList.forEach((type: string) => {
      const storedSignature = this.getSignature(type);
      if (storedSignature) {
        const image = new Image();
        image.src = storedSignature;
        this[type].fromDataURL(storedSignature);
      }
    });
  }

}
