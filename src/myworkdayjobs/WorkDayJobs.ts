import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import * as lodash from 'lodash';
import extractDate from '../utils/extractDate';
import { Facet, IFacet, IPriority } from './Facet';
import { JobPosting } from '../models/JobPosting';
import { IJobPostingCount, JobPostingCountModel } from '../models/JobPostingCount';

export interface MyWorkDayJobsPosting {
    title: string;
    externalPath: string;
    locationsText: string;
    postedOn: string;
    bulletFields: string[];
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

export class MyWorkDayJobs {
    filePath: string;
    JobPosting: Model<JobPosting>;
    JobPostingCount: JobPostingCountModel;
    byPostedOn: Map<string, Date>;
    byReferredIds: Map<string, string[]>;

    constructor(filePath: string, JobPostingModel: Model<JobPosting>, JobPostingCountModel: JobPostingCountModel) {
        this.filePath = filePath;
        this.JobPosting = JobPostingModel;
        this.JobPostingCount = JobPostingCountModel;
        this.byPostedOn = new Map<string, Date>();
        this.byReferredIds = new Map<string, string[]>();
    }

    private async init() {
        const latestReferredIds = await this.JobPostingCount.getLatestReferredIds();
        latestReferredIds.forEach((latestReferredId) => {
            this.byPostedOn.set(latestReferredId.company, latestReferredId.postedOn);
            this.byReferredIds.set(latestReferredId.company, latestReferredId.referredIds);
        })
    }

    private async fetchInitialFacets(company: string, apiUrl: string): Promise<Facet> {
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

    private async getAppliedFacetsAuto(
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
                appliedFacets: Object.fromEntries(appliedFacets.appliedFacets),
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

    private async transferToJobPostings(
        jobPostings: MyWorkDayJobsPosting[],
        company: string,
        originUrl: string,
    ): Promise<JobPosting[]> {
        // 1, Filter by titles
        const jobKeywords = ['software', 'full stack']; // TODO: should be configurable
        const jobKeywordsExclude = ['co-op']; // TODO: should be configurable
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
        const transferredJobPostings: JobPosting[] = [];
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

        // 3, Filter by posted date
        const purifiedJobPostings = transferredJobPostings.filter((jobPosting) => {
            const latestPostedOn = this.byPostedOn.get(company);
            const latestReferredIds = this.byReferredIds.get(company);
            if (latestPostedOn && jobPosting.postedOn.getTime() < latestPostedOn.getTime()) {
                return false;
            } else if (latestReferredIds && latestReferredIds.includes(jobPosting.referredId)) {
                return false;
            }
            return true;
        })
    
        return purifiedJobPostings;
    }

    private async loadJobPostings(jobPostings: JobPosting[]): Promise<void> {
        for (const jobPosting of jobPostings) {
            const newJobPosting = new this.JobPosting(jobPosting);
            await newJobPosting.save();
        }
    }

    /**
     * The entrance function.
     */
    async ETLJobPostings() {
        await this.init();

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
            const transferredJobPostings = await this.transferToJobPostings(
                allJobPostings,
                companyName,
                originUrl,
            );

            await this.loadJobPostings(transferredJobPostings);

            console.log(`finish ${companyName}'s ETL`);
        }
    }
}
