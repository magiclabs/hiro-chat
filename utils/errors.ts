export class TransactionError extends Error {
  constructor(
    message: string,
    public context?: any,
  ) {
    super(message);
    this.name = "TransactionError";
    if (context) {
      console.error("Error Context:", context);
    }
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export class SigningError extends Error {
  constructor(
    message: string,
    public context?: any,
  ) {
    super(message);
    this.name = "SigningError";
    if (context) {
      console.error("Signing Error Context:", context);
    }
  }
}
