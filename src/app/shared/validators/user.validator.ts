import { AbstractControl, FormArray, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";

export class UserValidator {
  constructor() {}

  static onlyChar(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (control.value == '') return null;

      let re = new RegExp('^[a-zA-Z ]*$');
      if (re.test(control.value)) {
        return null;
      } else {
        return { onlyChar: true };
      }
    };
  }

  /**
   * 
   * @param controlName 
   * @param matchingControlName 
   * This custom validator is created to match values of two controls.
   * @returns 
   */
  static mustMatch(controlName: string, matchingControlName: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const control = (<FormGroup>formGroup).controls[controlName];
      const matchingControl = (<FormGroup>formGroup).controls[matchingControlName];

      // set error on matchingControl if validation fails
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }

      return null;
    };
  }


}
