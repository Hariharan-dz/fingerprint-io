import { Injectable } from '@angular/core';
import { HTTPService } from './http.service';
import { environment } from 'src/environments/environment';

import { Plugins } from '@capacitor/core';
import { StorageService } from './storage.service';
const { Filesystem } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class OneDriveService {

  accessToken: string = '';
  ACCESS_TOKEN_URL: string = '';
  ONEDRIVE_URL: string = '';
  ONEDRIVE_CLIENT_ID: string = '';
  ONEDRIVE_CLIENT_SECRET: string = '';
  ONEDRIVE_TENANT_ID: string = '';
  ONEDRIVE_FOLDER_PATH: string = '';
  ONEDRIVE_OBJECT_ID: string = '';

  constructor(private httpService: HTTPService, private storageService: StorageService) {
    this.init();
  }

  async init() {
    this.ONEDRIVE_CLIENT_ID = await this.storageService.storage.get('ONEDRIVE_CLIENT_ID');
    this.ONEDRIVE_CLIENT_SECRET = await this.storageService.storage.get('ONEDRIVE_CLIENT_SECRET');
    this.ONEDRIVE_TENANT_ID = await this.storageService.storage.get('ONEDRIVE_TENANT_ID');
    this.ONEDRIVE_FOLDER_PATH = await this.storageService.storage.get('ONEDRIVE_FOLDER_PATH');
    this.ONEDRIVE_OBJECT_ID = await this.storageService.storage.get('ONEDRIVE_OBJECT_ID');

    this.ACCESS_TOKEN_URL = `https://login.microsoftonline.com/${this.ONEDRIVE_TENANT_ID}/oauth2/v2.0/token`;
    this.ONEDRIVE_URL = `https://graph.microsoft.com/v1.0/users/${this.ONEDRIVE_OBJECT_ID}`;
  }


  async generateAccessToken() {
    if (this.accessToken) return;
    var body = {
      grant_type: "client_credentials",
      client_id: this.ONEDRIVE_CLIENT_ID,
      client_secret: this.ONEDRIVE_CLIENT_SECRET,
      scope: "https://graph.microsoft.com/.default"
    };
    var result: any = await this.httpService.post(this.ACCESS_TOKEN_URL, body, { "Content-Type": "application/x-www-form-urlencoded" });
    this.accessToken = result.access_token;
  }

  async getFolderListByFolderId(parentFolderId: string) {
    var url: string = "";
    if (parentFolderId == "root") {
      url = `${this.ONEDRIVE_URL}/drive/root/children`;
    } else {
      url = `${this.ONEDRIVE_URL}/drive/items/${parentFolderId}/children`;
    }
    var result = await this.httpService.get(url, { 'Authorization': `Bearer ${this.accessToken}`, "Content-Type": "application/json" })
    return result.value;
  }

  formatItemPath(itemPath) {
    if (itemPath === "/") return "root"
    if (itemPath[0] === '/') itemPath = itemPath.slice(1);
    if (itemPath[itemPath.length - 1] === '/') itemPath = itemPath.slice(0, -1);
    return "root:/" + itemPath + ":";
  }

  async getFolderListByFolderPath(parentFolderPath: string) {
    var url = `${this.ONEDRIVE_URL}/drive/items/${this.formatItemPath(parentFolderPath)}/children`;
    var result = await this.httpService.get(url, { 'Authorization': `Bearer ${this.accessToken}`, "Content-Type": "application/json" })
    return result.value;
  }

  async getFolderDetailsByFolderId(folderName: string, parentFolderId: string) {
    return (await this.getFolderListByFolderId(parentFolderId)).find(folder => folder.name == folderName);
  }

  async getFolderDetailsByFolderPath(folderName: string, parentFolderPath: string) {
    return (await this.getFolderListByFolderPath(parentFolderPath)).find(folder => folder.name == folderName);
  }

  async createFolderByFolderId(folderName: string, parentFolderId: string) {
    var url: string = "";
    if (parentFolderId == "root") {
      url = `${this.ONEDRIVE_URL}/drive/items/root/children`;
    } else {
      url = `${this.ONEDRIVE_URL}/drive/items/${parentFolderId}/children`;
    }
    return await this.httpService.post(url, { name: folderName, folder: {} }, { Authorization: `Bearer ${this.accessToken}`, "Content-Type": "application/json" })
  }

  async createFolderByFolderPath(folderName: string, parentFolderPath: string) {
    var url = `${this.ONEDRIVE_URL}/drive/items/${this.formatItemPath(parentFolderPath)}/children`;
    return await this.httpService.post(url, { name: folderName, folder: {} }, { Authorization: `Bearer ${this.accessToken}`, "Content-Type": "application/json" })
  }

  async createFolderIfNotExistsByFolderId(folderName: string, parentFolderId: string) {
    var rootFolder = await this.getFolderDetailsByFolderId(folderName, parentFolderId);
    if (!rootFolder) rootFolder = await this.createFolderByFolderId(folderName, parentFolderId);
    return rootFolder;
  }

  async convertBase64ToBuffer(base64: string, contentType: string) {
    var response = await fetch(`data:${contentType};base64,${base64}`);
    return await (await response.blob()).arrayBuffer();
  }

  async uploadFileByFolderId(fileName: string, contentType: string, base64: string, parentFolderId: string) {
    var url: string = "";
    if (parentFolderId == "root") {
      url = `${this.ONEDRIVE_URL}/drive/items/root/children('${fileName}')/content`;
    } else {
      url = `${this.ONEDRIVE_URL}/drive/items/${parentFolderId}/children('${fileName}')/content`;
    }
    return await this.httpService.put(url, await this.convertBase64ToBuffer(base64, contentType), { Authorization: `Bearer ${this.accessToken}`, "Content-Type": "application/octet-stream" }, true);
  }

  async uploadFileByFolderPath(fileName: string, contentType: string, base64: string, parentFolderPath: string) {
    var url = `${this.ONEDRIVE_URL}/drive/items/${this.formatItemPath(parentFolderPath)}/children('${fileName}')/content`;
    return await this.httpService.put(url, await this.convertBase64ToBuffer(base64, contentType), { Authorization: `Bearer ${this.accessToken}`, "Content-Type": "application/octet-stream" }, true);
  }

  async upload(studentFolderName: string, attachmentList: any) {
    await this.init();
    await this.generateAccessToken();
    var studentFolder = await this.createFolderByFolderPath(studentFolderName, this.ONEDRIVE_FOLDER_PATH);
    await Promise.all(attachmentList.map(async (attachment: any) => {
      var { name, contentType, path: base64 } = attachment;
      await this.uploadFileByFolderId(name, contentType, base64, studentFolder.id);
    }));
    return studentFolder;
  }

}
