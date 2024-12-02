import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InterpretServerErrorService {

  constructor() { }

  /* Params:
   *      error Error
   * There are many different kind of error that can occur aty the server they should be standardized.
   * End user do not need see exact error but they need to see an error message which they can understand.
   */
  displayAppropriateError(error: any){
    let msg: string = '';
    let status: number = (error.statusCode)? error.statusCode: error.status;

    if(error.error == null && error.statusText == 'Gateway Timeout'){
      msg = 'Internet Connection Lost!!!';
    }
    else if(error.error.error == undefined && (error.statusText == 'Service Unavailable' || error.statusText == 'Unknown Error') ){
      msg = 'Server Disconnected!!!';
    }
    else if(error.error.error != undefined && error.statusText == 'Unprocessable Entity'){
      msg = 'Unprocessable Data Submitted!!!';
    }
    else if(error.error.error != undefined && error.statusText == 'Unauthorized'){
      msg = 'Session Expired!!!';
    }
    else if(error.error.error != undefined){
      msg = error.error.error.message;
    }
    else{
      msg = error.message;
    }

    return {msg: msg, status: status};
  }


}
