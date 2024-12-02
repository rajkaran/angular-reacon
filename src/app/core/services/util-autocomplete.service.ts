import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilAutocompleteService {

  constructor() { }

  /**
   * 
   * @param searchString 
   * @param haystack 
   * @param key 
   * Trim down haystack array to the elements that has key value matching searchstring.
   * @returns Array<any>
   */  
   searchOptionFilter(searchString: any, haystack: any, key: string): any {
    const filterValue = (typeof searchString == 'string')? searchString.toLowerCase(): searchString.toString();

    return haystack.filter( (hay: any) => {
      let item = (hay)? hay[key].toString().toLowerCase(): '';
      return item.includes(filterValue)
    });
  }

  /**
   * 
   * @param searchString 
   * @param haystack 
   * Trim down haystack array to the elements that matches searchstring. This performs same function as searchOptionFilter but on 1D array
   * @returns Array<any>
   */  
  filterOptions(searchString: string, haystack: any): any {
    const filterValue = searchString.toLowerCase();

    return haystack.filter( (hay: string) => {
      return hay.toLowerCase().includes(filterValue)
    });
  }


}
