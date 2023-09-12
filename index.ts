import { listJobPositions } from './pages/loblaw';
import puppeteer, { PuppeteerExtra } from 'puppeteer-extra';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

async function initPuppeteer(): Promise<PuppeteerExtra> {
    puppeteer.use(StealthPlugin());
    return puppeteer;
}

async function main() {
    const puppeteer = await initPuppeteer();
    const jobList =
        'https://myview.wd3.myworkdayjobs.com/en-US/loblaw_careers?q=software%20engineer&source=loblaw&utm_source=loblaw.ca&utm_medium=referral&locationRegionStateProvince=218a720b28a74c67b5c6d42c00bdadfa&timeType=f9ccda084af243cebebf4538f57811ab';

    listJobPositions(puppeteer, jobList);
}

main();
