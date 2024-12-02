import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ellipse'
})
export class EllipsePipe implements PipeTransform {

  transform(value: string, allowedLength: number): unknown {
    let result = value;

    if(value !== '' && value.length > allowedLength){
      result = value.slice(0, allowedLength)+'...';
    }

    return result;
  }

}
