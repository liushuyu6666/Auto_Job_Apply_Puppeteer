import { sub } from 'date-fns';

export default function (str: string): Date {
    const regex = /(\d+)/;
    const match = str.match(regex);

    if (match) {
        const daysAgo = parseInt(match[1], 10);
        return sub(new Date(), { days: daysAgo });
    } else {
        console.error(`No number found in the postedOn string ${str}`);
    }
}
