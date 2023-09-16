import { sub } from 'date-fns';

export default function (postedOn: string): Date | undefined {
    let daysAgo: number = 0;
    if (postedOn.toLowerCase().includes('yesterday')) {
        daysAgo = 1;
    } else if (postedOn.includes('30+')) {
        return undefined;
    } else {
        const regex = /Posted (\d+) Days Ago/;
        const match = postedOn.match(regex);

        if (match) {
            daysAgo = parseInt(match[1], 10);
        } else {
            console.error(
                `No number found in the postedOn string: ${postedOn}`,
            );
        }
    }

    const date = sub(new Date(), { days: daysAgo });
    date.setHours(0, 0, 0, 0);

    return date;
}
