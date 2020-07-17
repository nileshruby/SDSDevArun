export namespace CONSTANTS {
  export enum SESSION_TIMER {
    ONE_MINUTE = 60 * 1000,
    DEBUG_EXPIRATION_OFFSET = 0,
    //DEBUG_EXPIRATION_OFFSET = 7 * ONE_MINUTE,
    SHOW_WARNING_TIMER = 2 * ONE_MINUTE,
    //SHOW_WARNING_TIMER = 1.5 * ONE_MINUTE,
    SHOW_WARNING_DIALOG = ONE_MINUTE
  }

  export const app = {
    adminRouteBase: "admin",
    productsRouteBase: "products"
  };

  export enum productCodes {
    INTRD = "INTRO",
    RDMNT = "CRDMNT",
    CPQMR = "QR",
    CPRTP = "CPSRTP"
  }

  export const productFeatures = [
    {
      id: 1,
      name: "Workflow",
      isSection: true,
      children: [
        {
          id: 1,
          name: "Transaction Activity",
          url: "trans-activity",
          isGeneric: false
        },
        {
          id: 2,
          name: "RTP Transaction Activity",
          url: "rtp-trans-activity",
          isGeneric: false
        }
      ]
    },
    {
      id: 2,
      name: "Administration",
      isSection: true,
      children: [
        { id: 3, name: "FI Onboarding", url: "fionboarding", isGeneric: true },
        {
          id: 4,
          name: "Config Param",
          url: "config-parameters",
          isGeneric: true
        },
        {
          id: 5,
          name: "Product User Administration",
          url: "prod-usr-admin",
          isGeneric: true
        },
        {
          id: 6,
          name: "Service Instance",
          url: "service-instance",
          isGeneric: false
        },
        {
          id: 7,
          name: "Service Activity",
          url: "svc-activity",
          isGeneric: false
        },
        {
          id: 8,
          name: "Mastercard Fees - Rate Maintenance",
          url: "mastercard-fee-rate-main",
          isGeneric: false
        },
        { id: 9, name: "ICA Maintenance", url: "ica-main", isGeneric: false }
      ]
    }
  ];

  export const regex = {
    IsAlphaNumericRegEx: "^[A-Za-z0-9]+$",
    IsAlphaNumericWithSpecialCharactersRegEx: "^[a-zA-Z0-9?=.*!@#$%^&*_-s]+$",
    IsNumericOnlyRegEx: "^\\d+$",
    IsNumericOnlyRegExWithSpace: "^[ 0-9]+$",
    IsAlphaNumericWithSelectedSpecialCharactersRegEx:
      "^[a-zA-Z0-9?=.*!@$%^*(){},'/_-s]+$",
    SpecialCharWithSpaceOnPast: "[<>&# ]|&#",
    SpecialCharWithoutSpaceOnPast: "[<>&#]|&#",
    SpecialCharWithSpace: "^[^< >&#]*$",
    SpecialCharWithoutSpace: "^[^<>&#]*$",
    invalidPhoneNumber: "^d{3}-d{3}-d{4}$"
  };

  export const css = {
    bigImageBgSuffix: "-bg",
    productHighlightSuffix: "-highlighted",
    productSelectedCssClass: "selected",
    productDisableCssClass: "disabled"
  };

  export const adminsvchostMsgs = {
    saveFileSavedSuccess: "File saved successfully",
    failedFileSavedSuccess: "Failed to save changes"
  };

  export const adminprodmaintMsgs = {
    invalidProductName: "Invalid data, Please enter product name",
    invalidProductCode: "Invalid data, Please enter product code",
    invalidProductCodeMinimumValidation:
      "Invalid data. Product code should contain a greater 2 digit",
    invalidProductCodeMaximumValidation:
      "Invalid data.  Product code should contain at only 7 digits",
    invalidProductDelete:
      "FIs are onboarded for this product. First offboard all the FIs onboarded for this product and then delete the product"
  };

  export const adminusermaintMsgs = {
    invalidDataFormat: "Invalid data format.  Please enter a valid value",
    error: {
      checkuserlock: "Please check lock on user account and try reset password again",
      generalerror: "Please check data, try again",
      invalidOperation:
        'Operation not allowed, cannot update own account. Please use "User Profile" to make changes to your information',
      invalidPhoneNumber: "Phone Number should contain a 10 digit number",
      invalidCopyPasteUsername:
        "No spaces and special characters are allowed for username",
      invalidValue: "Invalid data.  Please enter a valid value",
      failSaveChangesSelectProduct: "Failed to save. Please assign product",
      failSaveChanges: "Failed to save.  Please try again",
      selectValue: "Please select a value",
      failEmailExists: "Failed to save changes. Email already exists",
      failUserExists: "Failed to save changes. Username already exists",
      validationRules: "Please Correct Validation Errors",
      invalidRole: "Invalid data, Role field is required",
      failLoadProducts: "Failed to load products. Please try again",
      isCPSUser:
        "This is CPS Admin User. You cannot make any changes for the user",
      fiNotAssociatedProd: "FI is not associated with the selected product"
    },
    questions: {
      userDuplicateConfirm: "Username already exist",
      userNotExistsConfirm: "Username is available",
      emailDuplicateConfirm: "Email already exist",
      emailNotExistsConfirm: "Email is available",
      userresetPaswordEmailSent: "Reset Password email has been sent",
      userresetSecurityEmailSent: "Reset Security Question email has been sent",
      selectedUserAssign:
        "You want to assign this selected product for this user",
      userresetPaswordEmailConfirm: "Confirm to Reset Password",
      userresetSecurityEmailConfirm:
        "Confirm to Reset Security Question/Answers",
      changeEditUserInfo: "Confirm to change user information",
      lockSecdAuthConfirm:
        "Confirm to lock Secondary Authentication for this user",
      unlockSecdAuthConfirm:
        "Confirm to unlock Secondary Authentication for this user",
      lockUserConfirm: "Confirm to lock user for this user",
      unlockUserConfirm: "Confirm to unlock user for this user",
      deleteUserConFirm: "Confirm to delete user",
      removeProductAssignment: "Remove product assignment of this user",
      itemDeleteConfirm: "Confirm to delete"
    },
    success: {
      lockstatus: "Lock status has been changed",
      userUpdate: "User updated successfully",
      userSave: "User saved successfully"
    }
  };

  export const adminfiadminMsgs = {
    invalidABA: "Invalid data, ABA Number should contain a 9-digit number",
    invalidBIN: "Invalid data, Please enter valid BIN",
    invalidFIName: "Invalid data,  Please enter a valid FI Name",
    itemDuplicateConfirm:
      "A duplicate ABA exist! Are you sure you want to save this item",
    invalidBINDetails:
      "Invalid data,  Please enter a valid System Number , Principal Number and Agent number"
  };

  export const genericCRUDMsgs = {
    deleteConfirm: "Confirm to delete",
    xmlsaveConfirm: "Are you sure overwrite the file",
    saveConfirm: "Confirm to save",
    updateConfirm: "Confirm to update",
    deleteSuccess: "Deleted successfully",
    saveSuccess: "Saved successfully",
    updateSuccess: "Updated successfully",
    deleteFailed: "Failed to save changes. Please try again",
    saveFailed: "Failed to save changes. Please try again by correcting data",
    saveFailedDuplicate: "Failed to save changes. Please try again by correcting data or check for duplicate ICA ",
    invalidInputs: "Invalid data, Please try again by correcting data",
    invalidValue: "Invalid data.  Please enter a valid value",
    sessionTimingOut:
      "Your session is about to expire due to inactivity.  Please click Yes to continue your session, or No to logoff",
    sessionExpired:
      "Your session has expired due to inactivity.  Please login to continue",
    loginFail:
      "Credentials are invalid. Contact your administrator if the problem persists",
    validationRules: "Please Correct Validation Errors"
  };

  export const cardMaintServiceActivityMsgs = {
    invalidServiceID: "Invalid data,  Please select a valid Service Instance",
    invalidSearchDate: "Invalid data, Please select a valid Search Date",
    invalidStartTime: "Invalid data, Please select a valid Start Time",
    invalidEndTime: "Invalid data,  Please select a valid End Time"
  };

  export const cardMaintTransactionActivityMsgs = {
    invalidServiceID: "Invalid data,  Please select a valid Service Instance",
    invalidSearchDate: "Invalid data, Please select a valid Search Date",
    invalidDate: "Invalid data, invalid Search Date",
    invalidStartTime: "Invalid data, Please select a valid Start Time",
    invalidEndTime: "Invalid data,  Please select a valid End Time",
    invalidDateRanges: "Start Time cannot be after End Time",
    invalidBIN: "Invalid data,  Please enter a valid BIN"
  };

  export const quarterlyReportingICAmaintMsgs = {
    invalidICAValue: "Invalid data.  Please enter a valid ICA value",
    updateICA: "Successfully updated ICA",
    saveICA: "Successfully added ICA",
    invalidStartTime: "Invalid data, Please select a valid Start Time",
    invalidEndTime: "Invalid data,  Please select a valid End Time",
    invalidDateRanges: "Start Time cannot be after End Time",
    invalidBIN: "Invalid data,  Please enter a valid BIN"
  };
  export const quarterlyReportingFeeRateMaintMsgs = {
    saveRate: "Successfully saved Rate",
    invalidRate: "Invalid data,  Please enter a valid Rate"
  };
  export const RTPTransactionActivityMsgs = {
    invalidFromDate: "Invalid data, Please select a valid From Date",
    invalidDate: "Invalid data, invalid From Date",
    invalidToDate: "Invalid data, Please select a valid To Date",
    invalidToDatevalue: "Invalid data, invalid To Date",
    invalidDateRanges: "Invalid data,  Please select a greater To date"
  };

  export const profileChangePasswordMsgs = {
    invalidCurrentPassword: "Invalid data, please enter valid current password",
    savePasswordSucess: "Password saved successfully",
    invalidPassword: "Invalid data, please enter valid password",
    invalidPasswordMatch:
      "Invalid data, Confirm Password does not match with the New Password entered"
  };

  export const profileSecurityQuestionMsgs = {
    invalidSecurityQuestion:
      "Invalid data,  Please select a valid security question",
    invalidSecurityAnswer: "Invalid data,  Please enter a valid security answer"
  };

  export const sharedComponentMsgs = {
    faileditemDelete: "Failed to delete item. Please try again",
    sucessitemDelete: "Successfully deleted item",
    configParameters: {
      invalidConfigKey: "Config Parameter key is already available",
      addConfig: "Successfully saved config",
      updateConfig: "Successfully updated config"
    },
    fiOnboarding: {
      restartServices: "Restart Services is not available at this time",
      fiDeleteSuccess: "FI deleted successfully",
      fiAddSuccess: "FI added successfully",
      fiOnboardFailed: "Failed to onboard FI. Please try again",
      fiOnboardComment: "Comment must be a minumum of 20 characters",      
      invalidGoLiveMandatoryFields: "Please provide values to all mandatory field",
      invalidGoliveConfigurationvalues: "Please provide values to mandatory configurations",
      invalidDataType: "Invalid Data Type,  Please select a valid value",
      invalidConfigKey: "Invalid Config Key,  Please enter a valid value",
      invalidConfigValue: "Invalid Config Value.  Please enter a valid value",
      invalidDate: "Invalid Date,  Please select a valid value",
      invalidConfigNumber: "Invalid data, Config Value is not a number.  Please enter a valid value",
      fiStateChange: "FI state has been changed",
      itemLiveConfirm: "The selected FI is live! Please offboard FI before deleting",
      restartProductService:"You have selected to restart services for this product, Are you sure you wish to proceed"
    },
    resetPassword: {
      invalidMessage: "Unable to reset password. please contact Administrator",
      invalidPassword: "Invalid password. please enter correct password",
      invalidData:
        "Invalid data, please enter valid data or contact adminstrator",
      invalidEntry: "Invalid Entry, try again",
      updateSecurityQuesAnswer:
        "Your security Question and answer has been updated",
      failupdateSecurityQuesAnswer:
        "Unable to update your security Question and answer",
      invalidPasswordHistory:
        "New password shall not match the recent 5 passwords",
      invalidPasswordwithUserName:
        "New password shall not include parts of the username",
      invalidPasswordRestriction:
        "Password must be minimum of 8 characters and contain a letter and a number",
      userresetSecurityEmailConfirm:
        "Confirm to Reset Security Question/Answers",
      updatePasswordSuccess: "Your password has been updated",
      confirmCancel:"Are you sure to cancel changes"
    },
    serviceInstance: {
      FailedLoadFIS: "Failed to load FIS. Please try again",
      saveSettingFile: "Message setting file saved successfully",
      saveSVCInstance: "Service Instance saved successfully",
      startServiceStatusRestriction:
        "Service cannot be started when status is PLANNED or DRBACKUP",
      failedStartService: "Failed to restart service. Please try again",
      deleteSVCInstance: "Service Instace deleted successfully",
      startServiceInstance: "Confirm to START this service",
      stopServiceInstance: "Confirm to STOP this service"
    },
    version: {
      saveVersion: "Version saved successfully",
      failSaveNotes: "Failed to save note changes. Please try again",
      deleteVersion: "Version deleted successfully",
      invalidNote: "Invalid data, Please enter valid note",
      saveNote: "Note saved successfully",
      deleteNote: "Note deleted successfully",
      invalidVersion: "Invalid data,  Please select a valid Version",
      invalidReleaseDate: "Invalid data,  Please select a valid Release Date"
    }
  };
}
