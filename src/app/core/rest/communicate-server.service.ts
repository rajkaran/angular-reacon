import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommunicateServerService {

  constructor(private http: HttpClient) { }

  fetch(url: string){
    return this.http.get(environment.api_url+url);
  }

  fetchWithHeaders(url: string, headers: any){
    return this.http.get(environment.api_url+url, headers);
  }

  fetchWithParam(url, param){
    return this.http.get(environment.api_url+url, param);
  }

  store(url: string, data: any){
    return this.http.post(environment.api_url+url, data);
  }

  patch(url: string, data: any){
    return this.http.patch(environment.api_url+url, data);
  }

  put(url: string, data: any){
    return this.http.put(environment.api_url+url, data);
  }

  delete(url: string){
    return this.http.delete(environment.api_url+url);
  }

  deleteWithParam(url, param){
    return this.http.delete(environment.api_url+url, param);
  }

}
