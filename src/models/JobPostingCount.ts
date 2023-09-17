import mongoose, { Model, Schema } from "mongoose";

export interface IJobPostingCount {
    company: string;
    postedOn: Date;
    referredIds: string[];
}

export interface JobPostingCountModel extends Model<IJobPostingCount> {
    getLatestReferredIds(): Promise<IJobPostingCount[]>;
}

const jobPostingCountSchema = new Schema<IJobPostingCount, JobPostingCountModel>({
    company: { type: String, required: true },
    postedOn: { type: Date, required: true },
    referredIds: { type: [String], required: true },
}, {
    statics: {
        async getLatestReferredIds(): Promise<IJobPostingCount[]> {
            return await this.aggregate([
                {
                    $sort: {
                        company: 1, // Sort by company in ascending order
                        postedOn: -1 // Sort by postedOn in descending order
                    }
                },
                {
                    $group: {
                        _id: "$company",
                        postedOn: { $first: "$postedOn" },
                        referredIds: { $first: "$referredIds" }
                    }
                },
                {
                    $project: {
                        company: "$_id",
                        postedOn: 1,
                        referredIds: 1,
                        _id: 0,
                    }
                }
            ]).exec();
        }
    }
});

export const JobPostingCountModel = mongoose.model<IJobPostingCount, JobPostingCountModel>(
    'jobpostingcounts',
    jobPostingCountSchema,
);
