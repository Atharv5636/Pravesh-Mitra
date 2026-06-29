# Pravesh Mitra

Pravesh Mitra is a full-stack admission guidance platform that helps students understand course eligibility, admission rules, and counseling workflows through an AI-assisted chat experience.

The project combines structured course-rule reasoning with document-grounded retrieval so users can ask both direct eligibility questions and broader brochure or policy questions in a natural way.

## What the Project Does

- Answers admission and eligibility questions through a chat interface.
- Supports multilingual responses in English, Marathi, and Hindi.
- Uses structured course JSON data for eligibility-focused reasoning.
- Uses RAG over uploaded PDF documents for brochure and policy-based answers.
- Stores chat history for signed-in users.
- Includes an admin panel for user management, document ingestion, reprocessing, and analytics.

## Current Stack

### Frontend

- React 18
- Vite
- React Router DOM
- Tailwind CSS
- Clerk authentication

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- Clerk token verification
- ChromaDB for vector retrieval
- Google Gemini for embeddings and response generation
- Groq as an LLM fallback provider
- Cloudinary for PDF hosting/storage
- `pdf-parse` for PDF extraction

## Key Features

### 1. AI Chat Assistant

The main product experience is a chat interface where users can:

- ask admission questions in natural language,
- receive grounded answers with citations,
- select a response language,
- continue multi-turn eligibility conversations,
- save and search previous chat sessions when signed in.

### 2. Eligibility Advisor

For course-specific admission questions, the backend can:

- detect the target course,
- load structured course eligibility rules,
- extract known facts from the user's message,
- identify missing requirements,
- continue follow-up questioning until enough facts are available,
- return a counselor-style eligibility answer.

### 3. Retrieval-Augmented Generation (RAG)

For brochure, process, or policy questions, the system can:

- parse uploaded PDFs,
- split them into page-aware chunks,
- generate embeddings,
- store them in Chroma,
- retrieve relevant chunks at question time,
- generate answers with source citations.

### 4. Admin Panel

Admins can:

- view dashboard stats,
- manage users and roles,
- upload source PDFs,
- reprocess existing documents,
- delete documents,
- migrate legacy local files to Cloudinary,
- view language/course usage and common questions.

## Project Structure

```text
pravesh-mitra/
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- layouts/
|   |   |-- pages/
|   |   |-- routes/
|   |   |-- services/
|   |   `-- main.jsx
|   |-- package.json
|   `-- vite.config.js
|
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- services/
|   |   `-- utils/
|   |-- resources/
|   |   |-- COURSES/
|   |   `-- POLICIES/
|   |-- scripts/
|   |-- tests/
|   |-- package.json
|   `-- server.js
|
|-- chroma/
|-- package.json
`-- README.md
```

## Main User Flows

### Student Flow

1. User opens the app.
2. User signs in with Clerk or continues as a guest.
3. User asks a question in chat.
4. Backend classifies the question.
5. System chooses either:
   - structured eligibility reasoning, or
   - document-grounded RAG retrieval.
6. User gets an answer, and signed-in users keep chat history.

### Admin Flow

1. Admin signs in.
2. Admin opens the admin panel.
3. Admin uploads a PDF brochure/policy document.
4. Backend stores the file, extracts text, chunks it, embeds it, and syncs it to Chroma.
5. The document becomes available for future RAG answers.

## Important Backend Modules

- `backend/src/controllers/chatSessionController.js`: chat session persistence and multi-turn flow handling.
- `backend/src/controllers/ragController.js`: public RAG chat endpoint.
- `backend/src/services/ragService.js`: retrieval pipeline, prompt construction, answer generation, and citations.
- `backend/src/services/eligibilityFlowService.js`: interactive eligibility reasoning flow.
- `backend/src/services/courseDetector.js`: course detection and ambiguity handling.
- `backend/src/services/documentService.js`: PDF ingestion, chunking, extraction, and embedding sync.
- `backend/src/services/chromaService.js`: vector storage and retrieval.
- `backend/src/services/llmService.js`: Gemini/Groq fallback orchestration.

## Authentication and Roles

The active authentication system is Clerk.

- Frontend uses Clerk for sign-in/sign-up flows.
- Backend verifies Clerk bearer tokens.
- User data is synced into MongoDB.
- Admin-only routes are protected by role checks.

## Data Sources

The project currently uses two major knowledge sources:

- structured course JSON files in `backend/resources/COURSES`,
- uploaded PDF documents processed into Chroma for retrieval.

This allows the app to answer both:

- rule-based questions such as eligibility and course comparisons,
- unstructured brochure/policy questions such as process details and definitions.

## Local Development

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB connection string
- Chroma instance
- Clerk keys
- Gemini API key
- Groq API key
- Cloudinary credentials

### Install

From the project root:

```bash
npm install
npm run install:all
```

### Environment Variables

Create `backend/.env` and add the required values for your environment.
Typical variables used by the backend include:

```env
PORT=5000
MONGODB_URI=
CLERK_SECRET_KEY=
GEMINI_API_KEY=
GEMINI_API_KEY_BACKUP=
GROQ_API_KEY=
GROQ_API_KEY_BACKUP=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CHROMA_URL=http://localhost:8000
NODE_ENV=development
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=
```

### Run

Frontend:

```bash
npm run dev:frontend
```

Backend:

```bash
npm run dev:backend
```

Or run package scripts directly inside `frontend` and `backend`.

## Available Scripts

### Root

- `npm run install:all`
- `npm run dev:frontend`
- `npm run dev:backend`
- `npm run build:frontend`
- `npm run preview:frontend`

### Backend

- `npm run dev`
- `npm run start`
- `npm run test:eligibility`
- `npm run clear-cache`

## Testing

The repository currently includes an eligibility-focused test harness:

```bash
cd backend
npm run test:eligibility
```

This validates structured eligibility evaluation against predefined test cases.

## Notes

- The current codebase is more advanced than the original scaffold README.
- Some Firebase files still exist in the repo, but the active auth flow is Clerk-based.
- Uploaded documents are processed for page-aware retrieval and citation support.
- Signed-in chat uses MongoDB-backed sessions; guest chat falls back to local storage in the browser.

## Future Improvement Areas

- Expand automated test coverage beyond eligibility logic.
- Refresh the landing page copy to reflect the current product.
- Remove or archive legacy Firebase code if it is no longer needed.
- Add deployment documentation for production environments.
