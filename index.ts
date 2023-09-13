import { mongodbConnection } from './src/mongodb';
import { Loblaw } from './myworkdayjobs/loblaw';

async function main() {
    const connection = await mongodbConnection('AutoJobs');
    const loblaw = new Loblaw('myworkdayjobs/myworkdayjobs.json');
    await loblaw.saveJobPostings();
    await connection.close();
}

main();
