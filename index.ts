import { JobPostingModel } from './src/models/JobPosting';
import { mongodbConnection } from './src/db/mongodb';
import { MyWorkDayJobs } from './src/myworkdayjobs/WorkDayJobs';
import { JobPostingCountModel } from './src/models/JobPostingCount';

async function main() {
    const connection = await mongodbConnection('AutoJobs');
    const myWorkDayJobs = new MyWorkDayJobs(
        'src/myworkdayjobs/myworkdayjobs.json',
        JobPostingModel,
        JobPostingCountModel,
    );
    await myWorkDayJobs.ETLJobPostings();

    await connection.close();
}

main();
