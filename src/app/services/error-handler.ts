import { HttpErrorResponse } from "@angular/common/http";
import { FormControl, FormGroup } from "@angular/forms";

export class ErrorHandler {
  public static getErrorMessage(control: FormControl<string>, hint = "") {
    if (!control || control.valid) {
      return null;
    }

    if (control.hasError("required")) {
      return `${hint} The field is required.`;
    }

    if (control.hasError("pattern")) {
      return "Not a valid e-mail address.";
    }

    if (control.hasError("minlength")) {
      return "The field must be at least " + (control.errors!["minlength"] as { requiredLength: number }).requiredLength + " characters long";
    }

    if (control.hasError("maxlength")) {
      return "The field must be at max " + (control.errors!["maxlength"] as { requiredLength: number }).requiredLength + " characters long";
    }

    if (control.hasError("serverSide")) {
      return control.errors!["serverSide"] as string;
    }
    return "";
  }

  public static getHttpErrorResponseMessage(error: HttpErrorResponse, fieldName: string): string | undefined {
    if (!error.error || !Object.prototype.hasOwnProperty.call(error.error, fieldName)) {
      return;
    }

    const errorObjectValue = error.error as Record<string, { Errors: { ErrorMessage: string }[] }>;
    if (
      Object.prototype.hasOwnProperty.call(errorObjectValue, fieldName)
      && Object.prototype.hasOwnProperty.call(errorObjectValue[fieldName], "Errors")
      && errorObjectValue[fieldName].Errors.length > 0
    ) {
      return errorObjectValue[fieldName].Errors.map(e => e.ErrorMessage).join(", ");
    }

    const errorStringValue = error.error as Record<string, string | string[]>;
    const errorValue = errorStringValue[fieldName];
    if (!errorValue) {
      return;
    }
    if (Array.isArray(errorValue)) {
      return errorValue[0];
    }
    return errorValue;
  }

  public static handleErrors(formGroup: FormGroup, error: Error) {
    if (error instanceof HttpErrorResponse) {
      switch (error?.status ?? 0) {
        case 400:
          let unknownFieldName = false;
          for (const fieldName in error.error) {
            const errorMessage = this.getHttpErrorResponseMessage(error, fieldName);

            if (errorMessage) {
              let jsonFieldName = fieldName;
              if (jsonFieldName.length > 0) {
                jsonFieldName = jsonFieldName[0].toLowerCase() + jsonFieldName.slice(1);
              }

              if (Object.prototype.hasOwnProperty.call(formGroup.controls, jsonFieldName)) {
                formGroup.controls[jsonFieldName].setErrors({ serverSide: errorMessage });
              } else {
                unknownFieldName = true;
              }
            }
          }
          if (unknownFieldName) {
            formGroup.setErrors({ serverSide: "Something went wrong." });
          }
          break;
        case 402:
          formGroup.setErrors({ serverSide: "You have reached the limits of your plan." });
          break;
        case 403:
          formGroup.setErrors({ serverSide: "You have no permission to execute this action." });
          break;
        default:
          formGroup.setErrors({ serverSide: "Something went wrong on our side. This is not your fault. Please try again." });
          break;
      }
    } else {
      formGroup.setErrors({
        serverSide: "Something went wrong on our side. This is not your fault. Please try again.",
      });
    }
  }
}
