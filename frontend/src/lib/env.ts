const required = (value: string | undefined, name: string) => {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
};

export const env = {
  apiBaseUrl: required(process.env.NEXT_PUBLIC_API_URL, "NEXT_PUBLIC_API_URL"),
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Movie Booking",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
};