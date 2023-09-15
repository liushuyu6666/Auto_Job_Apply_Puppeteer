import extractDate from '../../utils/extractDate';
import { sub } from 'date-fns';

describe('extractDate', () => {
    test('when the postedOn is yesterday, return the date', () => {
        const postedOn = 'Posted Yesterday';
        const date = extractDate(postedOn);

        const expectedDate = sub(new Date(), { days: 1 });
        expectedDate.setHours(0, 0, 0, 0);

        expect(date).toEqual(expectedDate);
    });

    test('when the postedOn contains a number, return the date', () => {
        const postedOn = 'Posted 21 Days Ago';
        const date = extractDate(postedOn);

        const expectedDate = sub(new Date(), { days: 21 });
        expectedDate.setHours(0, 0, 0, 0);

        expect(date).toEqual(expectedDate);
    });

    test('when the postedOn contains a number+, should return undefined', () => {
        const postedOn = 'Posted 30+ Days Ago';
        const date = extractDate(postedOn);

        expect(date).toBe(undefined);
    });
});
