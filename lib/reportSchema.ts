export const REPORT_SCHEMA = {
  type: "object",
  properties: {
    business_summary: { type: "string" },
    automation_opportunities: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          problem: { type: "string" },
          solution: { type: "string" },
          ai_capability: { type: "string" },
          estimated_impact: { type: "string" },
          request_to_specialist: { type: "string" },
        },
        required: [
          "title",
          "problem",
          "solution",
          "ai_capability",
          "estimated_impact",
          "request_to_specialist",
        ],
        additionalProperties: false,
      },
    },
    priority_recommendation: { type: "string" },
    next_step: { type: "string" },
  },
  required: [
    "business_summary",
    "automation_opportunities",
    "priority_recommendation",
    "next_step",
  ],
  additionalProperties: false,
} as const;
