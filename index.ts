import { mongodbConnection } from './src/mongodb';
import { MyWorkDayJobs } from './src/myworkdayjobs/WorkDayJobs';

async function main() {
    const connection = await mongodbConnection('AutoJobs');
    const myWorkDayJobs = new MyWorkDayJobs(
        'src/myworkdayjobs/myworkdayjobs.json',
    );
    // await loblaw.ETLJobPostings();
    await myWorkDayJobs.ETLJobPostings();
    await connection.close();
}

main();
