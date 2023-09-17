import mongoose, { Schema } from "mongoose";
import { JobPostingCountModel } from "./JobPostingCount";

export interface JobPosting {
    company: string;
    title: string;
    referredId: string;
    portalUrl: string;
    locationsText: string;
    postedOn: Date;
}

const jobPostingSchema = new Schema<JobPosting>({
    company: { type: String, required: true },
    title: { type: String, required: true },
    referredId: { type: String, required: true },
    portalUrl: { type: String, required: true },
    locationsText: { type: String, required: true },
    postedOn: { type: Date, required: true },
});

jobPostingSchema.post('save', async function (doc: JobPosting) {
    const jobPosting = doc;

    let jobPostingCount = await JobPostingCountModel.findOne({
        company: jobPosting.company,
        postedOn: jobPosting.postedOn
    });

    if (jobPostingCount) {
        jobPostingCount.referredIds.push(jobPosting.referredId);
        await jobPostingCount.save();
    } else {
        jobPostingCount = new JobPostingCountModel({
            company: jobPosting.company,
            postedOn: jobPosting.postedOn,
            referredIds: [jobPosting.referredId]
        });
        await jobPostingCount.save();
    }
})

export const JobPostingModel = mongoose.model<JobPosting>(
    'JobPostings',
    jobPostingSchema,
);