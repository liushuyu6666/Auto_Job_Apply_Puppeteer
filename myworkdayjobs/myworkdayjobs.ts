import { Browser } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

export class MyWorkDayJobs {
    browser: Browser;
    jobSearchPage: string;

    constructor(jobSearchPage: string) {
        this.jobSearchPage = jobSearchPage;
    }

    async init() {
        puppeteer.use(StealthPlugin());
        this.browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
        });
    }

    async captureJobSearchPageRequests() {
        try {
            const page = await this.browser.newPage();
            page.on('request', (request) => {
                console.log('Request URL:', request.url());
                console.log(
                    'Request Headers:',
                    JSON.stringify(request.headers(), null, 2),
                );

                // If this is a POST request, you might want to log the POST data
                if (request.method() === 'POST') {
                    console.log('POST Data:', request.postData());
                }
            });

            await page.goto(this.jobSearchPage);
        } catch (error) {
            console.error('Error opening the URL: ', error);
        } finally {
            if (this.browser) await this.browser.close();
        }
    }
}
