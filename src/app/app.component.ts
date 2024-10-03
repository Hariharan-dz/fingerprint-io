import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  isMenuCollapse = true;
  urlList: any = ['/login']
  menuList = [
    {
      title: 'Application',
      image: 'document-text-outline',
      link: '/home',
    },
    {
      title: 'Admin',
      image: 'person-circle-outline',
      link: '/admin',
    },
  ];
  constructor(private menuController: MenuController, public route: Router, private storageService: StorageService) {}

  

  closeMenu() {
    this.menuController.close();
  }
}

