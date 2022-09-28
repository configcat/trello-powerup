import { AbstractControl, FormGroup } from "@angular/forms";

export class ErrorHandler {

    public static getErrorMessage(control: AbstractControl, hint: string = '') {
        if (!control || control.valid) {
            return;
        }

        if (control.hasError('required')) {
            return `${hint} The field is required.`;
        }

        if (control.hasError('pattern')) {
            return 'Not a valid e-mail address.';
        }

        if (control.hasError('minlength')) {
            return 'The field must be at least ' + control.getError('minlength').requiredLength + ' characters long';
        }

        if (control.hasError('maxlength')) {
            return 'The field must be at max ' + control.getError('maxlength').requiredLength + ' characters long';
        }

        if (control.hasError('serverSide')) {
            return control.getError('serverSide');
        }

        return;
    }

    public static handleErrors(formGroup: FormGroup, error: any) {
        switch (error?.status ?? 0) {
            case 400:
                let unknownFieldName = false;
                for (const fieldName in error.error) {
                    if (error.error.hasOwnProperty(fieldName) && error.error[fieldName] &&
                        (error.error[fieldName]?.length > 0 || error.error[fieldName]?.Errors?.length > 0)) {
                        let jsonFieldName = fieldName;
                        if (jsonFieldName.length > 0) {
                            jsonFieldName = jsonFieldName[0].toLowerCase() + jsonFieldName.slice(1);
                        }

                        const errorMessage = error.error[fieldName]?.Errors?.length > 0 ?
                            (error.error[fieldName]?.Errors.map((e: any) => e.ErrorMessage)).join(', ')
                            : error.error[fieldName];

                        if (formGroup.controls.hasOwnProperty(jsonFieldName)) {
                            formGroup.controls[jsonFieldName].setErrors({ serverSide: errorMessage });
                        } else {
                            unknownFieldName = true;
                        }
                    }
                }
                if (unknownFieldName) {
                    formGroup.setErrors({ serverSide: 'Something went wrong.' });
                }
                break;
            case 402:
                formGroup.setErrors({ serverSide: 'You have reached the limits of your plan.' });
                break;
            case 403:
                formGroup.setErrors({ serverSide: 'You have no permission to execute this action.' });
                break;
            default:
                formGroup.setErrors({ serverSide: 'Something went wrong on our side. This is not your fault. Please try again.' });
                break;
        }
    }
}