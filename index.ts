import { Loblaw } from './myworkdayjobs/loblaw';

async function main() {
    const appliedFacets = {
        locationRegionStateProvince: ['218a720b28a74c67b5c6d42c00bdadfa'],
        timeType: ['f9ccda084af243cebebf4538f57811ab'],
    };
    const loblaw = new Loblaw();
    const jobPostings = await loblaw.fetchAllJobPostings(
        'https://myview.wd3.myworkdayjobs.com/wday/cxs/myview/loblaw_careers/jobs',
        appliedFacets,
    );
    const filtered = loblaw.jobPostingFilter(jobPostings);
    console.log(filtered);
}

main();
