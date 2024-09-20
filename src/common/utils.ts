// Define all the common functions and methods
export function isDateBefore(date1: Date, date2: Date): boolean {
    return date1.getTime() < date2.getTime();
}

export function convertToUTC(localDate: Date): string {
    const date = new Date(localDate);
    const utcTime = date.toISOString(); // 
    return utcTime;
}

export function getCurrentTime(date:string): string {
    const replacedDate = new Date(date);
    const now = new Date();
    const hours = Number(padStart(now.getHours().toString(),2, '0'));
    const minutes = Number(padStart(now.getMinutes().toString(), 2, '0'));
    const seconds = Number(padStart(now.getSeconds().toString(), 2, '0'));
    const newDate = replaceTimeInDate(replacedDate,hours,minutes,seconds);
    return `${newDate}`;
}

export function padStart(str: string, targetLength: number, padString: string = ' '): string {
    while (str.length < targetLength) {
        str = padString + str;
    }
    return str;
}

export function replaceTimeInDate(date: Date, hours: number, minutes: number, seconds: number): Date {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hours,
        minutes,
        seconds
    );
}
