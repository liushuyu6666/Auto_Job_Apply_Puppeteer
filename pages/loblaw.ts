import puppeteer, { Browser, Page } from 'puppeteer';
import delay from '../utils/delay';

const jobList =
    'https://myview.wd3.myworkdayjobs.com/en-US/loblaw_careers?q=software%20engineer&source=loblaw&utm_source=loblaw.ca&utm_medium=referral&locationRegionStateProvince=218a720b28a74c67b5c6d42c00bdadfa&timeType=f9ccda084af243cebebf4538f57811ab';

export async function listJobPositions(): Promise<void> {
    let browser: Browser;
    try {
        browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
        });
        const page = await browser.newPage();
        await page.goto(jobList);
        await delay(5000);
        await fetchJobList(page);
    } catch (error) {
        console.error('Error opening the URL: ', error);
    } finally {
        if (browser) await browser.close();
    }
}

async function fetchJobList(jobResults: Page) {
    const htmlContent = await jobResults.$$eval(
        'a[data-automation-id="jobTitle"]',
        async (elements) =>
            elements.map((element) => {
                // console.log(element);
                return {
                    href: element.href,
                    title: element.innerHTML,
                };
            }),
    );
    console.log(htmlContent);
}

listJobPositions();
