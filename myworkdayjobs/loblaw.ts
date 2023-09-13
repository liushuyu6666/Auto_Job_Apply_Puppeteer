export interface JobPosting {
    title: string;
    externalPath: string;
    locationsText: string;
    postedOn: string;
    bulletFields: string[];
}

export class Loblaw {
    allJobPostings: JobPosting[];

    constructor() {}

    // async fetchFacets(url: string) {
    //     const payload = {
    //         appliedFacets: {},
    //         limit: 1,
    //         offset: 0,
    //         searchText: '',
    //     };
    //     const requestOptions: RequestInit = {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(payload),
    //     };
    //     const response = await fetch(url, requestOptions);

    //     if (!response.ok) {
    //         throw new Error(`HTTP error! Status: ${response.status}`);
    //     }

    //     const json = await response.json();

    //     const locationId = this.extractLocationFromFacets(json);

    //     console.log(locationId);
    // }

    // extractLocationFromFacets(response: any) {
    //     const facets = response['facets'];
    //     const locations = facets.find(
    //         (fac) => fac['facetParameter'] === 'locationMainGroup',
    //     );
    //     const locationValues = locations['values'];
    //     const locationRegionStateProvince = locationValues.find(
    //         (loc) => loc['facetParameter'] === 'locationRegionStateProvince',
    //     );
    //     const locationRegionStateProvinceValues =
    //         locationRegionStateProvince['values'];
    //     const ontario = locationRegionStateProvinceValues.find(
    //         (loc) => loc['descriptor'] === 'Ontario',
    //     );
    //     return ontario['id'];
    // }

    async fetchAllJobPostings(
        url: string,
        appliedFacets: any,
    ): Promise<JobPosting[]> {
        const allJobPosting: JobPosting[] = [];
        let currJobPostings: JobPosting[] = [];
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
            const response = await (await fetch(url, requestOptions)).json();
            currJobPostings = response['jobPostings'];
            Array.prototype.push.apply(allJobPosting, currJobPostings);
            i++;
        } while (currJobPostings.length === limit && i < 5); // only list top 100 posting

        return allJobPosting;
    }

    jobPostingFilter(jobPostings: JobPosting[]) {
        const jobKeywords = ['software', 'full stack']; // TODO: should be configurable
        const jobKeywordsExclude = ['co-op']; // TODO: should be configurable
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
}
