const { GoogleGenAI } = require("@google/genai")
const z = require("zod");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

const technicalDifficultyValues = ["easy", "medium", "hard"]

function normalizeQuestion(question) {
    return question.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
}

function questionSimilarity(first, second) {
    const firstWords = new Set(normalizeQuestion(first).split(" "))
    const secondWords = new Set(normalizeQuestion(second).split(" "))
    const intersection = [...firstWords].filter((word) => secondWords.has(word)).length
    const union = new Set([...firstWords, ...secondWords]).size
    return union === 0 ? 1 : intersection / union
}

// Jaccard similarity over normalized words catches questions that differ only in phrasing.
// The 0.8 threshold rejects near-duplicates while allowing distinct questions on related topics.
function validateUniqueQuestions(questions, name) {
    for (let index = 0; index < questions.length; index++) {
        for (let otherIndex = index + 1; otherIndex < questions.length; otherIndex++) {
            if (questionSimilarity(questions[index].question, questions[otherIndex].question) >= 0.8) {
                throw new Error(`${name} contains duplicate or near-duplicate questions`)
            }
        }
    }
}

// Validate model output locally because the provider's response schema is not runtime validation.
const interviweReportSchema = z.object({

    candidateName: z.string(),

    position: z.string(),

    matchScore: z.number().min(0).max(100),

    interviewerFeedback: z.string(),

    technicalQuestions: z.array(
        z.object({
            question: z.string(),
            topic: z.string(),
            difficulty: z.enum(technicalDifficultyValues),
            reason: z.string(),
            intention: z.string(),
            answer: z.string()
        })
    ).min(5).max(10),

    behavioralQuestions: z.array(
        z.object({
            question: z.string(),
            category: z.string(),
            reason: z.string(),
            intention: z.string(),
            answer: z.string()
        })
    ).min(5).max(10),

    skillGaps: z.array(
        z.object({
            skill: z.string(),
            severity: z.enum(["low", "medium", "high"])
        })
    ),

    preparationPlan: z.array(
        z.object({
            day: z.number(),
            focus: z.string(),
            tasks: z.array(z.string())
        })
    )

});





const interviewReportJsonSchema = {
    type: "object",

    properties: {
        candidateName: {
            type: "string"
        },

        position: {
            type: "string"
        },

        matchScore: {
            type: "number",
            minimum: 0,
            maximum: 100
        },

        interviewerFeedback: {
            type: "string"
        },

        technicalQuestions: {
            type: "array",
            minItems: 5,
            maxItems: 10,
            items: {
                type: "object",
                properties: {
                    question: {
                        type: "string"
                    },
                    topic: {
                        type: "string"
                    },
                    difficulty: {
                        type: "string",
                        enum: ["easy", "medium", "hard"]
                    },
                    reason: {
                        type: "string"
                    },
                    intention: {
                        type: "string"
                    },
                    answer: {
                        type: "string"
                    }
                },
                required: [
                    "question",
                    "topic",
                    "difficulty",
                    "reason",
                    "intention",
                    "answer"
                ]
            }
        },

        behavioralQuestions: {
            type: "array",
            minItems: 5,
            maxItems: 10,
            items: {
                type: "object",
                properties: {
                    question: {
                        type: "string"
                    },
                    category: {
                        type: "string"
                    },
                    reason: {
                        type: "string"
                    },
                    intention: {
                        type: "string"
                    },
                    answer: {
                        type: "string"
                    }
                },
                required: [
                    "question",
                    "category",
                    "reason",
                    "intention",
                    "answer"
                ]
            }
        },

        skillGaps: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    skill: {
                        type: "string"
                    },
                    severity: {
                        type: "string",
                        enum: [
                            "low",
                            "medium",
                            "high"
                        ]
                    }
                },
                required: [
                    "skill",
                    "severity"
                ]
            }
        },

        preparationPlan: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    day: {
                        type: "number"
                    },
                    focus: {
                        type: "string"
                    },
                    tasks: {
                        type: "array",
                        items: {
                            type: "string"
                        }
                    }
                },
                required: [
                    "day",
                    "focus",
                    "tasks"
                ]
            }
        }
    },

    required: [
        "candidateName",
        "position",
        "matchScore",
        "interviewerFeedback",
        "technicalQuestions",
        "behavioralQuestions",
        "skillGaps",
        "preparationPlan"
    ]
};


// Constrain the generated format, then validate the response locally before returning it.
async function generateInterviewReport({resume, selfDescription, jobDescription}){



const prompt = `
Generate a high-quality, personalized interview report for the candidate.

Use ONLY the information provided in the Resume, Self Description, and Job Description.

Do not invent projects, technologies, experience, achievements, responsibilities, or skills that are not supported by the provided information.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}


OUTPUT RULES:

1. Return ONLY one valid JSON object.
2. Do NOT return Markdown.
3. Do NOT use code fences.
4. Do NOT add headings or explanations.
5. Do NOT return the JSON as a string.
6. Do NOT add fields that are not defined in the required schema.
7. Follow the exact field names and data types defined below.


REQUIRED JSON STRUCTURE:


candidateName:
A string containing the candidate's name.

Example:
"candidateName": "Atul Kumar"


position:
A string containing the job position being evaluated.

Example:
"position": "Software Development Intern"


matchScore:
A NUMBER between 0 and 100.

Example:
"matchScore": 85

Never return:
"matchScore": "85"
"matchScore": "85%"


interviewerFeedback:
A string containing concise and useful feedback about the candidate.

It should cover:
- strongest relevant skills
- relevant project experience
- alignment with the job description
- important improvement areas

Do not invent information.


technicalQuestions:
MUST be an array of 5 to 10 objects. Choose the count dynamically: use 8 to 10 when the JD is detailed or lists many skills, and use 5 to 7 only when the role is genuinely simple.

Cover different relevant areas from the JD and candidate profile, such as fundamentals, frameworks, APIs, data, security, debugging, version control, algorithms, and project architecture. Do not include irrelevant categories or repeat the same concept.

At least 30% should be easy, about 40% medium, and about 30% hard. Adjust toward easier questions for a fresher while still including useful challenge questions.

Every object MUST contain exactly:

{
  "question": "string",
    "topic": "string",
    "difficulty": "easy | medium | hard",
    "reason": "string",
  "intention": "string",
  "answer": "string"
}

Example:

"technicalQuestions": [
  {
    "question": "Explain how you implemented JWT authentication in your project.",
        "topic": "Authentication",
        "difficulty": "medium",
        "reason": "The candidate's resume mentions JWT authentication and the JD requires secure APIs.",
    "intention": "Assess the candidate's understanding of authentication and token-based session management.",
    "answer": "I implemented JWT-based authentication by generating a signed token after successful login and sending it with protected API requests."
  }
]

IMPORTANT:
technicalQuestions MUST NOT be an array of strings.

Wrong:
"technicalQuestions": [
  "question",
  "intention",
  "answer"
]

Correct:
"technicalQuestions": [
  {
    "question": "...",
    "intention": "...",
    "answer": "..."
  }
]

Generate questions based on the candidate's actual resume, projects, skills, and the job description.
Compare the JD with the resume and self-description. Add questions about important skills required by the JD but missing or weak in the candidate profile, without claiming the candidate already has those skills. Ask project-specific questions whenever the profile supports them.

Answers should be realistic interview answers that the candidate could actually give based on their provided experience.

Do not invent experience.


behavioralQuestions:
MUST be an array of 5 to 10 objects. Prefer 7 to 10 when enough candidate and JD information is available. Do not generate duplicate or near-duplicate questions.

Every object MUST contain exactly:

{
  "question": "string",
    "category": "string",
    "reason": "string",
  "intention": "string",
  "answer": "string"
}

Questions should evaluate:
- problem solving
- debugging
- teamwork
- communication
- ownership
- handling challenges
- learning ability
- communication, adaptability, ownership, motivation, and project challenges when relevant

Answers must be personalized using the candidate's actual experience.

Do not invent experiences.


skillGaps:
MUST be an array of objects.

Every object MUST contain exactly:

{
  "skill": "string",
  "severity": "low"
}

severity MUST be exactly one of:

"low"
"medium"
"high"

Example:

"skillGaps": [
  {
    "skill": "TypeScript",
    "severity": "medium"
  },
  {
    "skill": "Cloud Deployment",
    "severity": "high"
  }
]

Never return skillGaps as a flat array of strings.


preparationPlan:
MUST be an array of objects.

Every object MUST contain exactly:

{
  "day": number,
  "focus": "string",
  "tasks": ["string"]
}

IMPORTANT:
day MUST be a NUMBER.

Correct:
"day": 1

Wrong:
"day": "Day 1"
"day": "1-5"

tasks MUST always be an array of strings.

Example:

"preparationPlan": [
  {
    "day": 1,
    "focus": "TypeScript Fundamentals",
    "tasks": [
      "Learn TypeScript types, interfaces, and generics.",
      "Convert one existing React component from JavaScript to TypeScript."
    ]
  },
  {
    "day": 2,
    "focus": "Cloud Deployment",
    "tasks": [
      "Learn how to deploy a full-stack application.",
      "Understand environment variables and basic CI/CD."
    ]
  }
]


FINAL CHECK:

Before returning the response, verify that:

- candidateName is a string.
- position is a string.
- matchScore is a number from 0 to 100.
- interviewerFeedback is a string.
- technicalQuestions contains 5 to 10 unique objects.
- Every technical question has question, intention, and answer as strings.
- Every technical question also has topic, difficulty, and reason.
- behavioralQuestions contains 5 to 10 unique objects.
- Every behavioral question has question, intention, and answer as strings.
- Every behavioral question also has category and reason.
- skillGaps is an array of objects.
- Every skill gap has skill and severity.
- severity is only low, medium, or high.
- preparationPlan is an array of objects.
- day is a number.
- focus is a string.
- tasks is an array of strings.
- No required field is missing.
- No incorrect data types are used.
- Return ONLY the JSON object.
`;

    let response
    let lastError

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            response = await ai.models.generateContent({
                model: "gemini-3.1-flash-lite",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseJsonSchema: interviewReportJsonSchema
                }
            })
            break
        } catch (error) {
            lastError = error
            if (attempt < 3) {
                await new Promise((resolve) => setTimeout(resolve, attempt * 1000))
            }
        }
    }

    if (!response) {
        const geminiError = new Error("Gemini request failed", { cause: lastError })
        geminiError.code = "GEMINI_REQUEST_FAILED"
        throw geminiError
    }


const parsedResponse = JSON.parse(response.text);

const result = interviweReportSchema.parse(parsedResponse);
validateUniqueQuestions(result.technicalQuestions, "Technical questions")
validateUniqueQuestions(result.behavioralQuestions, "Behavioral questions")



return result;
}

module.exports = { generateInterviewReport }