import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';


@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  storage = {
    get: async (key: string) => {
      return ((await Preferences.get({ key })) || {}).value;
    },
    set: async (key: string, value: any) => {
      return await Preferences.set({ key, value });
    },
    remove: async (key: string) => {
      return await Preferences.remove({ key });
    },
    clear: async () => {
      return await Preferences.clear();
    },
  };

}
