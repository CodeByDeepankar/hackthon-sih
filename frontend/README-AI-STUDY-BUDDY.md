# AI Study Buddy Integration

This project now includes an AI-powered Study Buddy (Gemini) for students:

## Features
- Quick ask widget on the student dashboard (concise answers)
- Full chat interface at `/student/study-buddy` with modes:
  - `answer` – short answer + brief explanation
  - `explain` – step-by-step deeper explanation
  - `practice` – answer + follow-up practice questions
- Basic in-memory rate limiting (30 requests / minute per IP)

## Backend Endpoint
POST `/ai/study-buddy`
```
{
  "question": "What is photosynthesis?",
  "mode": "answer" | "explain" | "practice",
  "history": [ { "role": "user"|"assistant", "content": "..." } ]
}
```
Response:
```
{ "answer": "...", "mode": "answer" }
```

## Environment Variable
Create or update `backend/.env` (DO NOT COMMIT REAL KEY):
```
GEMINI_API_KEY=YOUR_REAL_KEY
```
If `GEMINI_API_KEY` is missing the `/ai/study-buddy` route will return an error.

## Security Notes
- Never expose the Gemini API key in frontend code.
- Do not push your real `.env` to git.
- Rate limiting is minimal; for production add a persistent store (Redis) or external gateway.
- Consider adding logging & abuse detection if you open it publicly.

## Extending
You can add:
- Streaming responses: switch to the streaming Gemini endpoint and chunk responses.
- Citation support: prompt the model to return sources.
- Subject-aware tutoring: prepend current subject / grade level context to the prompt.

## Troubleshooting
| Issue | Fix |
|-------|-----|
| 500 error from AI route | Ensure `GEMINI_API_KEY` is set and valid |
| Answers seem generic | Use `explain` or add more context in the question |
| Practice questions missing | Use `practice` mode |
| Rate limited | Wait 60 seconds (per-IP window) |

## Disclaimer
AI output may contain mistakes. Encourage students to verify critical answers.
