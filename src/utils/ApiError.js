// Define a new class called ApiError that extends (inherits from) the built-in Error class
class ApiError extends Error {
    // The constructor is a special method used to initialize an object of this class
    constructor(
        statusCode,                      // The HTTP status code (e.g., 404, 500) related to the error
        message = "Something went wrong",// The error message; if not provided, defaults to "Something went wrong"
        errors = [],                     // An array to hold specific error details; defaults to an empty array
        stack = ""                       // The stack trace (where the error occurred); if not provided, it's empty
    ){
        // Call the parent (Error) class constructor with the message
        super(message)

        // Set the HTTP status code to the error object
        this.statusCode = statusCode

        // Initialize a data property as null (can be used to store additional information)
        this.data = null

        // Set the message property of the error object
        this.message = message

        // Set a success property to false (indicating that the operation failed)
        this.success = false;

        // Set the errors property to the passed array (or empty array if none provided)
        this.errors = errors

        // If a stack trace is provided, use it; otherwise, capture the current stack trace
        if (stack){
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

// Export the ApiError class so it can be used in other files
export { ApiError }
