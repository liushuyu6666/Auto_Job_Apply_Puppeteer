import { Browser, Page } from 'puppeteer';

import delay from '../src/utils/delay';
import { PuppeteerExtra } from 'puppeteer-extra';

export interface JobTitleAndHref {
    title: string;
    href: string;
}

export interface JobBriefInfo {
    title: string;
    href: string;
    position: string;
    postedTime: string;
    jobId: string;
}

export async function listJobPositions(
    puppeteer: PuppeteerExtra,
    url: string,
): Promise<void> {
    let browser: Browser;
    try {
        browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
        });
        const page = await browser.newPage();
        await page.goto(url);
        await delay(5000); // Just in case the page close before the dynamic content (job listings in this case) is fully loaded.
        const jobBriefInfo = await getJobBriefInfo(page);
        console.log(jobBriefInfo);
    } catch (error) {
        console.error('Error opening the URL: ', error);
    } finally {
        if (browser) await browser.close();
    }
}

async function getJobBriefInfo(jobResultsPage: Page): Promise<JobBriefInfo[]> {
    const size = await getJobSize(jobResultsPage);
    console.log(size);
    const [titleAndHrefs, positions, postedTimes, jobId] = await Promise.all([
        getJobTitleAndHrefList(jobResultsPage),
        getJobPositionList(jobResultsPage),
        getJobPostedTimeList(jobResultsPage),
        getJobId(jobResultsPage),
    ]);

    const jobBriefInfo: JobBriefInfo[] = [];
    for (let i = 0; i < jobId.length; i++) {
        const info: JobBriefInfo = {
            ...titleAndHrefs[i],
            position: positions[i],
            postedTime: postedTimes[i],
            jobId: jobId[i],
        };
        jobBriefInfo.push(info);
    }

    return jobBriefInfo;
}

async function getJobSize(jobResults: Page): Promise<string> {
    const size = await jobResults.$eval(
        'p[data-automation-id="jobFoundText"]',
        (element) => element.innerHTML,
    );
    return size;
}

async function getJobTitleAndHrefList(
    jobResults: Page,
): Promise<JobTitleAndHref[]> {
    return await jobResults.$$eval(
        'a[data-automation-id="jobTitle"]',
        (elements) =>
            elements.map((element) => {
                return {
                    href: element.href,
                    title: element.innerHTML,
                };
            }),
    );
}

async function getJobPositionList(jobResults: Page): Promise<string[]> {
    return await jobResults.$$eval(
        'div[data-automation-id="locations"] > dl > dd',
        (elements) => elements.map((element) => element.innerHTML),
    );
}

async function getJobPostedTimeList(jobResults: Page): Promise<string[]> {
    return await jobResults.$$eval(
        'div[data-automation-id="postedOn"] > dl > dd',
        (elements) => elements.map((element) => element.innerHTML),
    );
}

async function getJobId(jobResults: Page): Promise<string[]> {
    return await jobResults.$$eval(
        'ul[data-automation-id="subtitle"] > li',
        (elements) => elements.map((element) => element.innerHTML),
    );
}

// https://myview.wd3.myworkdayjobs.com/en-US/loblaw_careers?source=loblaw&utm_source=loblaw.ca&utm_medium=referral&locationRegionStateProvince=218a720b28a74c67b5c6d42c00bdadfa&timeType=f9ccda084af243cebebf4538f57811ab
// https://myview.wd3.myworkdayjobs.com/en-US/loblaw_careers?source=loblaw&utm_source=loblaw.ca&utm_medium=referral&locationRegionStateProvince=218a720b28a74c67b5c6d42c00bdadfa&timeType=f9ccda084af243cebebf4538f57811ab
