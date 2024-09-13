import { ref, Ref } from 'vue';
type UseFileName = { fileName: Ref<string>; generateFileName: (funcName: string) => void; };
export function useFileName(): UseFileName {
    const fileName = ref('');
    function padStart(str: string, targetLength: number, padString: string = '0'): string {
        targetLength = targetLength >> 0; // Truncate if number or convert non-number to 0;
        if (str.length > targetLength) {
            return String(str);
        } else {
            targetLength = targetLength - str.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength / padString.length); // Append to original to ensure we are longer than needed
            }
            return padString.slice(0, targetLength) + String(str);
        }
    }
    function generateFileName(funcName: string): void {
        const now = new Date();
        const year = now.getFullYear();
        const month = padStart(String(now.getMonth() + 1), 2);
        const day = padStart(String(now.getDate()), 2);
        const hours = padStart(String(now.getHours()), 2);
        const minutes = padStart(String(now.getMinutes()), 2);

        fileName.value = `${funcName}_${year}-${month}-${day}_${hours}-${minutes}.xlsx`;
    }

    return {
        fileName,
        generateFileName
    };
}