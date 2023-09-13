import mongoose, { Model, Schema } from 'mongoose';
import * as fs from 'fs';

export interface MyWorkDayJobsPosting {
    title: string;
    externalPath: string;
    locationsText: string;
    postedOn: string;
    bulletFields: string[];
}

export interface AppliedFacets {
    locationRegionStateProvince: string[];
    timeType: string[];
}

export interface JobSearchParams {
    companyName: string;
    url: string;
    appliedFacets: AppliedFacets;
}

export class Loblaw {
    jobPostingModel: Model<MyWorkDayJobsPosting>;
    filePath: string;

    constructor(filePath: string) {
        const jobPostingSchema = new Schema<MyWorkDayJobsPosting>({
            title: { type: String, required: true },
            externalPath: { type: String, required: true },
            locationsText: { type: String, required: true },
            postedOn: { type: String, required: true },
            bulletFields: { type: [String], required: true },
        });

        this.jobPostingModel = mongoose.model<MyWorkDayJobsPosting>(
            'MyWorkDayJobPosting',
            jobPostingSchema,
        );

        this.filePath = filePath;
    }

    private async readJobSearchParams(): Promise<JobSearchParams[]> {
        return JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
    }

    private async fetchAllJobPostings(
        jobSearchParams: JobSearchParams,
    ): Promise<MyWorkDayJobsPosting[]> {
        const allJobPostings: MyWorkDayJobsPosting[] = [];
        let currJobPostings: MyWorkDayJobsPosting[] = [];
        const limit = 20;
        let i = 0;
        const { url, appliedFacets } = jobSearchParams;

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
            const response = await (await fetch(url, requestOptions)).json();
            currJobPostings = response['jobPostings'];
            Array.prototype.push.apply(allJobPostings, currJobPostings);
            i++;
        } while (currJobPostings.length === limit && i < 5); // only list top 100 posting

        return allJobPostings;
    }

    private jobPostingFilter(jobPostings: MyWorkDayJobsPosting[]) {
        const jobKeywords = ['software', 'full stack']; // TODO: should be configurable
        const jobKeywordsExclude = ['co-p']; // TODO: should be configurable
        return jobPostings.filter(
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
    }

    async saveJobPostings() {
        const jobSearchParams = await this.readJobSearchParams();
        for (const jobSearchParam of jobSearchParams) {
            const { companyName } = jobSearchParam;
            const allJobPostings =
                await this.fetchAllJobPostings(jobSearchParam);
            const filterJobPostings = this.jobPostingFilter(allJobPostings);

            for (const jobPosting of filterJobPostings) {
                const newJobPosting = new this.jobPostingModel(jobPosting);
                await newJobPosting.save();
            }

            console.log(`finish ${companyName}'s posting`);
        }
    }
}
