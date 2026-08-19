export const APP_MODE = process.env.NEXT_PUBLIC_APP_MODE === "prod" ? "prod" : "test";

export const IS_PROD = APP_MODE === "prod";
