const mongoose = require("mongoose");

const configuredRetentionDays = Number.parseInt(process.env.HISTORY_RETENTION_DAYS || "30", 10);
const historyRetentionDays = Number.isFinite(configuredRetentionDays) && configuredRetentionDays > 0
    ? configuredRetentionDays
    : 30;

const technicalQuestionSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true
        },

        topic: {
            type: String,
            required: true
        },

        difficulty: {
            type: String,
            enum: ["easy", "medium", "hard"],
            required: true
        },

        reason: {
            type: String,
            required: true
        },

        intention: {
            type: String,
            required: true
        },

        answer: {
            type: String,
            required: true
        }
    },
    {
        _id: false
    }
);


const behavioralQuestionSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true
        },

        category: {
            type: String,
            required: true
        },

        reason: {
            type: String,
            required: true
        },

        intention: {
            type: String,
            required: true
        },

        answer: {
            type: String,
            required: true
        }
    },
    {
        _id: false
    }
);


const skillGapSchema = new mongoose.Schema(
    {
        skill: {
            type: String,
            required: true
        },

        severity: {
            type: String,
            enum: ["low", "medium", "high"],
            required: true
        }
    },
    {
        _id: false
    }
);


const preparationPlanSchema = new mongoose.Schema(
    {
        day: {
            type: Number,
            required: true
        },

        focus: {
            type: String,
            required: true
        },

        tasks: {
            type: [String],
            required: true
        }
    },
    {
        _id: false
    }
);





const interviewReportSchema = new mongoose.Schema(
    {
        candidateName: {
            type: String,
            required: true
        },

        position: {
            type: String,
            required: true
        },

        interviewerFeedback: {
            type: String,
            required: true
        },

        matchScore: {
            type: Number,
            min: 0,
            max: 100,
            required: true
        },

        technicalQuestions: {
            type: [technicalQuestionSchema],
            required: true
        },

        behavioralQuestions: {
            type: [behavioralQuestionSchema],
            required: true
        },

        skillGaps: {
            type: [skillGapSchema],
            required: true
        },

        preparationPlan: {
            type: [preparationPlanSchema],
            required: true
        },
        jobDescription: {
            type: String,
            required: true,
            trim: true
        },
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"users",
            required: true,
            index: true
        }
    },
    {
        timestamps: true
    }
);

interviewReportSchema.index({ user: 1, createdAt: -1 });
// MongoDB's TTL monitor removes reports after the configured retention interval.
interviewReportSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: historyRetentionDays * 24 * 60 * 60 }
);


const interviewReportModel =
    mongoose.model("InterviewReport", interviewReportSchema);


module.exports = interviewReportModel;