import { IUser } from "db/tables-interfaces/user";

export interface InstagramAccount {
  name: string;
  account_tag: string;
  account_link: string;
}

export type LoaderData =
  | { success: true; response: InstagramAccount }
  | { success: false; response: string };

type ActionDataSuccess = {
  success: true;
  user: IUser;
};

type ActionDataError = {
  success: false;
  error: string | Record<string, unknown>;
};

export type ActionData = ActionDataSuccess | ActionDataError;
