import { mongodbConnection } from './src/mongodb';
import { MyWorkDayJobs } from './src/myworkdayjobs/MyWorkDayJobs';

async function main() {
    const connection = await mongodbConnection('AutoJobs');
    console.log(typeof MyWorkDayJobs);
    const myWorkDayJobs = new MyWorkDayJobs(
        'src/myworkdayjobs/myworkdayjobs.json',
    );
    // await loblaw.ETLJobPostings();
    await myWorkDayJobs.ETLJobPostings();
    await connection.close();
}

main();
