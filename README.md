# Fatima Darija Assist

Fatima Darija Assist is a Tunisian Darija and French assistant application. It combines a React interface, Supabase authentication and storage, Edge Functions, chat history, translation features, and LLM-backed assistant workflows.

The project is positioned as a practical AI assistant application rather than a generic chatbot. It focuses on language support, user sessions, personalization, and backend integration.

## Features

- Chat interface for Tunisian Darija and French
- Supabase authentication and user profiles
- Chat session and message history
- Translation workflow between Darija and French
- Voice-oriented UI screens
- Supabase Edge Functions for assistant, translation, news, and account workflows
- Admin and subscription-related surfaces

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Supabase
- Supabase Edge Functions
- LLM API integrations

## Project Structure

```text
fatima-darija-assist/
|-- public/
|-- src/
|   |-- components/
|   |-- hooks/
|   |-- integrations/
|   |-- pages/
|   `-- services/
|-- supabase/
|   |-- functions/
|   `-- migrations/
|-- package.json
`-- README.md
```

## Run Locally

```bash
npm install
npm run dev
```

For Supabase functions and database migrations, use the Supabase CLI with a configured local or remote project.

## Environment

Keep local secrets outside Git. Use `.env.example` as a template for local values.

## Notes

This repository demonstrates assistant-style product thinking, frontend state management, Supabase-backed backend work, and practical multilingual UX for Tunisian users.
