export type LoaderData =
  | { success: true; id: number | undefined }
  | { success: false; error: string };

export type ActionData = { success: false; error: string };
