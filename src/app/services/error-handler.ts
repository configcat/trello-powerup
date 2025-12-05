import { HttpErrorResponse } from "@angular/common/http";
import { FormGroup } from "@angular/forms";
import { FormHelper } from "ng-configcat-publicapi-ui";

export class ErrorHandler {

  public static handleErrors(formGroup: FormGroup, error: Error) {
    if (error instanceof HttpErrorResponse) {
      switch (error?.status ?? 0) {
        case 400:
          let unknownFieldName = false;
          for (const fieldName in error.error) {
            const errorMessage = FormHelper.getHttpErrorResponseMessage(error, fieldName);

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

  public static getErrorMessage(error: Error): string {
    if (error instanceof HttpErrorResponse) {
      switch (error?.status ?? 0) {
        case 400:
          for (const fieldName in error.error) {
            const errorMessage = FormHelper.getHttpErrorResponseMessage(error, fieldName);

            if (errorMessage) {
              return errorMessage;
            }
          }
          return "Something went wrong.";
        case 402:
          return "You have reached the limits of your plan.";
        case 403:
          return "You have no permission to execute this action.";
        default:
          return "Something went wrong on our side. This is not your fault. Please try again.";
      }
    } else {
      return "Something went wrong on our side. This is not your fault. Please try again.";
    }
  }
}
