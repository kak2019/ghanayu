// Define all the common functions and methods
export function isDateBefore(date1: Date, date2: Date): boolean {
    return date1.getTime() < date2.getTime();
}
