import { Injectable } from '@angular/core';
import { isPlatform } from '@ionic/angular';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import '@capacitor-community/http';
import { Plugins } from '@capacitor/core';
const { Http } = Plugins;


@Injectable({
  providedIn: 'root'
})
export class HTTPService {

  isCapacitorPlatform: boolean = isPlatform('capacitor');

  constructor() { }

  async get(url: string, headers: any, useFetch: boolean = false) {
    return await this.send("GET", url, null, headers, useFetch);
  }

  async post(url: string, data: any, headers: any, useFetch: boolean = false) {
    return await this.send("POST", url, data, headers, useFetch);
  }

  async put(url: string, data: any, headers: any, useFetch: boolean = false) {
    return await this.send("PUT", url, data, headers, useFetch);
  }

  async delete(url: string, data: any, headers: any, useFetch: boolean = false) {
    return await this.send("DELETE", url, data, headers, useFetch);
  }

  async send(method: string, url: string, data: any, headers: any, useFetch: boolean = false) {
    if (!useFetch && this.isCapacitorPlatform) {
      return await from(Http.request({ method, url, data, headers }))
        .pipe(map((result: any) => {
          if (result.error) throw result.data;
          return result.data;
        })).toPromise();
    } else {
      var response = await fetch(url, { method, headers, body: data });
      return response.json();
    }
  }

}
