export interface UserPayload {
  id: number;
  role: string;
}

declare global {
  namespace Express {
    export interface Request {
      user?: UserPayload;
    }
  }
}
export {};
