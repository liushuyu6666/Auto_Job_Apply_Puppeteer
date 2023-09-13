import mongoose, { Model, Schema } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import extraDate from '../utils/extraDate';

export interface MyWorkDayJobsPosting {
    title: string;
    externalPath: string;
    locationsText: string;
    postedOn: string;
    bulletFields: string[];
}

// This is the database schema
export interface JobPostings {
    company: string;
    title: string;
    referredId: string;
    portalUrl: string;
    locationsText: string;
    postedOn: Date;
}

export interface JobSearchParams {
    companyName: string;
    apiUrl: string;
    appliedFacets: any;
    originUrl: string;
}

export class Loblaw {
    jobPostingModel: Model<JobPostings>;
    filePath: string;

    constructor(filePath: string) {
        const jobPostingSchema = new Schema<JobPostings>({
            company: { type: String, required: true },
            title: { type: String, required: true },
            referredId: { type: String, required: true },
            portalUrl: { type: String, required: true },
            locationsText: { type: String, required: true },
            postedOn: { type: Date, required: true },
        });

        this.jobPostingModel = mongoose.model<JobPostings>(
            'JobPosting',
            jobPostingSchema,
        );

        this.filePath = filePath;
    }

    private async readJobSearchParams(): Promise<JobSearchParams[]> {
        return JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
    }

    private async extractAllJobPostings(
        apiUrl: string,
        appliedFacets: any,
    ): Promise<MyWorkDayJobsPosting[]> {
        const allJobPostings: MyWorkDayJobsPosting[] = [];
        let currJobPostings: MyWorkDayJobsPosting[] = [];
        const limit = 20;
        let i = 0;

        // TODO: TOO SLOW
        do {
            const payload = {
                appliedFacets,
                limit,
                offset: i * limit,
                searchText: 'software engineer',
            };
            const requestOptions: RequestInit = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            };
            const response = await (await fetch(apiUrl, requestOptions)).json();
            currJobPostings = response['jobPostings'];
            Array.prototype.push.apply(allJobPostings, currJobPostings);
            i++;
        } while (currJobPostings.length === limit && i < 5); // only list top 100 posting

        return allJobPostings;
    }

    private transferToJobPostings(
        jobPostings: MyWorkDayJobsPosting[],
        company: string,
        originUrl: string,
    ): JobPostings[] {
        // 1, Filter
        const jobKeywords = ['software', 'full stack']; // TODO: should be configurable
        const jobKeywordsExclude = ['co-p']; // TODO: should be configurable
        const filteredJobPostings = jobPostings.filter(
            (jobPosting) =>
                jobKeywords.some(
                    (keyword) =>
                        jobPosting.title.toLowerCase().indexOf(keyword) >= 0,
                ) &&
                !jobKeywordsExclude.some(
                    (keyword) =>
                        jobPosting.title.toLowerCase().indexOf(keyword) >= 0,
                ),
        );

        // 2, Transfer
        return (filteredJobPostings || []).map((jobPosting) => ({
            company,
            title: jobPosting.title,
            referredId: jobPosting.bulletFields[0],
            portalUrl: path.join(originUrl, jobPosting.externalPath),
            locationsText: jobPosting.locationsText,
            postedOn: extraDate(jobPosting.postedOn),
        }));
    }

    async loadJobPostings(jobPostings: JobPostings[]): Promise<void> {
        for (const jobPosting of jobPostings) {
            const newJobPosting = new this.jobPostingModel(jobPosting);
            await newJobPosting.save();
        }
    }

    async ETLJobPostings() {
        const jobSearchParams = await this.readJobSearchParams();
        for (const jobSearchParam of jobSearchParams) {
            const { companyName, originUrl, apiUrl, appliedFacets } =
                jobSearchParam;
            const allJobPostings = await this.extractAllJobPostings(
                apiUrl,
                appliedFacets,
            );
            const transferredJobPostings = this.transferToJobPostings(
                allJobPostings,
                companyName,
                originUrl,
            );

            await this.loadJobPostings(transferredJobPostings);

            console.log(`finish ${companyName}'s ETL`);
        }
    }
}
