import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor() { }

  /**
   * 
   * @param date1 
   * @param date2 
   * @param measure 
   * Find difference beetween two dates. bydefault it returens in seconds
   * although user can get result in different measure such as minutes, hours
   * or days.
   * @returns 
   */
  dateDiff(date1: Date, date2: Date, measure: string): Observable<number>{
    let diff =(date2.getTime() - date1.getTime()) / 1000;

    if(measure == 'minutes'){
        diff /= 60;
    }
    else if(measure == 'hours'){
        diff /= 3600;
    }
    else if(measure == 'days'){
        diff /= 86400;
    }
    else{
        diff = diff;
    }

    return of(Math.abs(Math.round(diff)));
  }

  /**
   * 
   * @param haystack 
   * @param key 
   * @param match 
   * This is same as in_array method but for array of objects. This method will return index of 
   * object whose property's value(key) matches value(match).
   * @returns 
   */
  in2DArray(haystack: any, key: string, match: any): Observable<number>{
    let result: number = -1;

    for(let i = 0, len = haystack.length; i < len; i++){
        if(haystack[i][key].toLowerCase() == match.toLowerCase()){
            result = i;
        }
    }

    return of(result);
  }

  /**
   * 
   * @param obj 
   * this function deep clone an object. Although only work with Number and String and Object literal without function or Symbol properties.
   * Community recommends using lodash for cloning.
   */
  deepClone(obj: any): Observable<any>{
    return of(JSON.parse(JSON.stringify(obj)));
  }

}
