import mongoose, { Model, Schema } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import * as lodash from 'lodash';
import extractDate from '../utils/extractDate';
import { Facet, IFacet, IPriority } from './Facet';

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

export interface Company {
    companyName: string;
    apiUrl: string;
    originUrl: string;
}

export interface MainGroupPriority {
    mainGroupText: string;
    priorities: IPriority[];
}

export interface JobSearchParams {
    companies: Company[];
    mainGroupPriorities: MainGroupPriority[];
}

export type AppliedFacetsValues = Map<string, string[]>;

export interface AppliedFacets {
    appliedFacets: AppliedFacetsValues;
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

    async fetchInitialFacets(company: string, apiUrl: string): Promise<Facet> {
        const payload = {
            appliedFacets: {},
            limit: 1,
            offset: 0,
        };
        const requestOptions: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        };
        const response = await (await fetch(apiUrl, requestOptions)).json();

        const facets: IFacet[] = response['facets'];
        return new Facet(facets, company);
    }

    async getAppliedFacetsAuto(
        companyName: string,
        apiUrl: string,
        mainGroupPriorities: MainGroupPriority[],
    ): Promise<AppliedFacets> {
        const facet = await this.fetchInitialFacets(companyName, apiUrl);
        const appliedFacetsValues: AppliedFacetsValues = new Map<
            string,
            string[]
        >();

        for (const MainGroupPriority of mainGroupPriorities) {
            const { mainGroupText, priorities } = MainGroupPriority;
            const facetCards = facet.getPrioritizedFacetCards(
                mainGroupText,
                priorities,
            );

            const firstFacetCards =
                facet.getTheFirstPriorityFacetCards(facetCards);
            const grouped = lodash.groupBy(firstFacetCards, 'facetParameter');

            for (const [facetParameter, cards] of Object.entries(grouped)) {
                const ids = cards.map((card) => card.facetValue.id);
                appliedFacetsValues.set(facetParameter, ids);
            }
        }

        return {
            appliedFacets: appliedFacetsValues,
        };
    }

    private async readJobSearchParams(): Promise<JobSearchParams> {
        return JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
    }

    private async extractAllJobPostings(
        apiUrl: string,
        appliedFacets: AppliedFacets,
    ): Promise<MyWorkDayJobsPosting[]> {
        const allJobPostings: MyWorkDayJobsPosting[] = [];
        let currJobPostings: MyWorkDayJobsPosting[] = [];
        const limit = 20;
        let i = 0;

        // TODO: TOO SLOW
        do {
            const payload = {
                ...appliedFacets,
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
        const jobKeywordsExclude = ['co-0p']; // TODO: should be configurable
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
        const transferredJobPostings: JobPostings[] = [];
        for (const jobPosting of filteredJobPostings) {
            const postedDate = extractDate(jobPosting.postedOn);
            if (postedDate) {
                transferredJobPostings.push({
                    company,
                    title: jobPosting.title,
                    referredId: jobPosting.bulletFields[0],
                    portalUrl: path.join(originUrl, jobPosting.externalPath),
                    locationsText: jobPosting.locationsText,
                    postedOn: postedDate,
                });
            }
        }
        return transferredJobPostings;
    }

    async loadJobPostings(jobPostings: JobPostings[]): Promise<void> {
        for (const jobPosting of jobPostings) {
            const newJobPosting = new this.jobPostingModel(jobPosting);
            await newJobPosting.save();
        }
    }

    /**
     * The entrance function.
     */
    async ETLJobPostings() {
        const { companies, mainGroupPriorities } =
            await this.readJobSearchParams();
        for (const company of companies) {
            const { companyName, originUrl, apiUrl } = company;
            const appliedFacets = await this.getAppliedFacetsAuto(
                companyName,
                apiUrl,
                mainGroupPriorities,
            );
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
