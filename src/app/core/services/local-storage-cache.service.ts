import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageCacheService {

  constructor() { }

  setItem(itemObject: any, key: string): void{
    sessionStorage.setItem(key, JSON.stringify(itemObject));
  }

  getItem(key: string): any{
    let result: any = undefined;

    if(sessionStorage.getItem('accessToken')){
      let keyContent: any = sessionStorage.getItem(key);
      result = JSON.parse( keyContent );
    }

    return result;
  }

  unsetItem(key: string): void{
    sessionStorage.removeItem(key);
  }

  clear(): void{
    sessionStorage.clear();
  }

  
}
