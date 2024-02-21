export class BaseSerializer {
    statusCode: number;
    success: boolean;
    message: string;
    data: any;
    errors: any;
  
    constructor(statusCode: number, success: boolean, message: string, data: any, errors: any) {
        this.statusCode = statusCode;
        this.success = success;
        this.message = message;
        this.data = data;
        this.errors = errors;
    }
  }