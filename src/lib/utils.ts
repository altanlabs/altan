/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBase64FromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
