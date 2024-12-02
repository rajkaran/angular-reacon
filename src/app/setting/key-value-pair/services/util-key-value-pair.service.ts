import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DropdownOption, KeyValuePair } from 'src/app/core/models/key-value-pair.model';

@Injectable({
  providedIn: 'root'
})
export class UtilKeyValuePairService {

  constructor() { }

  /**
   * 
   * @param keyValuePairs 
   * Extract an array of distinct types from an array of key-value pairs.
   * solution is inspired from https://stackoverflow.com/a/14438954
   * @returns 
   */
  extractPairtypes(keyValuePairs: KeyValuePair[]): Observable<string[]>{
    let types: string[] = keyValuePairs.map( (pair: KeyValuePair) => pair.pairType);
    return of([...new Set(types)]);
  }

  /**
   * 
   * @param keyValuePairs 
   * @param selectedCategory 
   * @param selectedStatus 
   * Filter key-value pair to only those matches the selection. If status is 'any' then only condition to match
   * is category otherwise both selected values should be matched by key-value pair.
   * @returns 
   */
  filterKeyValuePair(keyValuePairs: KeyValuePair[], selectedCategory: string, selectedStatus: string): Observable<KeyValuePair[]>{
    let result: KeyValuePair[] = [];

    for(let i = 0, len = keyValuePairs.length; i < len; i++){

      if(selectedStatus === 'any'){
        if(keyValuePairs[i].pairType === selectedCategory){
          result.push(keyValuePairs[i]);
        }
      }
      else{
        let isActive = (selectedStatus === 'active')? true: false;

        if(keyValuePairs[i].isActive === isActive && keyValuePairs[i].pairType === selectedCategory){
          result.push(keyValuePairs[i])
        }
      }
    }

    return of(result);
  }

  /**
   * 
   * @param dropDownName 
   * @param key 
   * When a user picks an option from a dropdown we would save the associated key in the database.
   * whereas when save dropdown option need to be presented on the view we will have to replace the 
   * key with displayText which user picked before.
   */
  findInDropDownOptions(dropDownOptions: DropdownOption[], key: string){
    let result = '';

    for(let i = 0, len = dropDownOptions.length; i < len; i++){
      if(dropDownOptions[i].key == key){
        result = dropDownOptions[i].displayText;
      }
    }

    return result;
  }
  

    
}
