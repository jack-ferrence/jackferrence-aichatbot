## My approach

I began this project by using ChatGPT to turn the assignment into a detailed technical specification. Before writing code, I worked through the required stack, authentication flow, database structure, security boundaries, chat behavior, deployment requirements, and visual direction.

My goal was to give Claude Code enough context to build toward a specific result instead of asking it to create a generic chatbot. I broke the project into detailed requirements covering:

* Next.js App Router and TypeScript
* PostgreSQL with Prisma
* Auth.js credentials authentication
* User-owned conversations and messages
* Server-side Anthropic API requests
* Environment-variable and secret handling
* The expected interface and application states
* README, deployment, and verification requirements

I then pasted those requirements into Claude Code and used it as the primary implementation tool. I delegated most of the code generation to Claude Code, including the Prisma schema, authentication flow, API routes, chat components, and initial styling.

My role was primarily defining the requirements, directing the implementation, reviewing the results, identifying problems, and asking Claude Code to make targeted corrections. I also configured the required tools and external services, handled deployment, and stepped in when the application’s behavior did not match the intended result.

I used ChatGPT again to help organize and edit this write-up.

## Where AI helped

Claude Code was especially useful for producing large, connected sections of the application. Because it could work across the repository, it was able to keep the Prisma models, route handlers, authentication logic, and UI components reasonably consistent.

It also helped significantly with the interface. I chose to model the application’s colors and overall visual tone after Tevora’s public brand colors because the project was being built for Tevora. The final interface uses an original design, but the navy and bright accent colors were selected to make the submission feel relevant to the company and the Atlas product environment.

AI was also effective for repetitive implementation work, such as creating the initial project structure, defining database models and relationships, building forms and application states, connecting the chat interface to the API routes, adding validation and error handling and producing an initial README and setup instructions.

This let me spend more time thinking about how the pieces should work together and testing the completed flow.

## Where AI got in the way

The main limitation was that Claude Code could drift outside the intended scope or overlook simple details when my prompts were not precise enough. It could produce a large amount of plausible-looking code quickly, but that did not guarantee the full application worked correctly.

For example, the first deployment reached the authentication screen but could not complete registration because the production Postgres database had not yet been provisioned and migrated. Vercel hosted the Next.js application, but the database still had to be created, connected, and initialized separately. Resolving that required looking beyond the generated application code and understanding the complete deployment environment.

The originally selected Claude model identifier also was not available to the API key being used. That problem only became clear during a real API request, so I changed the model configuration to an available model while keeping it configurable through an environment variable.

These issues reinforced that AI-generated code still needs active supervision. The tool is effective at implementation, but it can miss deployment assumptions, use outdated configuration, or confidently complete the wrong task if the instructions are ambiguous.

## Decisions and trade-offs

I used PostgreSQL with Prisma because the application has clearly related data: users own chats, and chats own messages. Prisma made those relationships easy to understand and enforce.

I chose Auth.js with credentials authentication and JWT sessions. This kept the demo’s data model relatively small because it did not require separate database-backed session and account tables. Passwords are hashed before storage, and authenticated user IDs are used to scope chat queries.

Anthropic requests are made only from server-side routes, and the API key is stored in an environment variable. No provider credentials are sent to the browser or committed to the repository.

I chose not to add streaming responses because it was optional and the assignment specified a four-hour time expectation. A complete non-streaming request flow was more important than adding another layer of complexity. Conversation context is also limited to recent messages instead of implementing token-aware summarization.

## What I would improve with more time

With more time, I would first add a committed automated test suite around authentication, chat ownership, persistence, and API failure behavior. Those areas matter more to me than adding visual effects.

I would also consider adding:

* Streaming Claude responses
* Conversation renaming and deletion
* Markdown and code-block rendering
* Password recovery
* Rate limiting for registration and AI requests
* Token-aware conversation trimming or summarization
* File uploads or voice input
* Better mobile navigation

I would eventually specialize the assistant for a particular field rather than leave it as a general chatbot. Connecting it to a focused body of information, supporting relevant documents, and designing workflows around a real user problem would make it much more useful.

## Final reflection

This project showed me that using AI effectively is less about asking it to “build an app” and more about defining the result, giving it clear constraints, reviewing what it produces, and testing the entire system.

Claude Code performed most of the code writing, but I remained responsible for the scope, technical decisions, debugging, integrations, deployment, and final behavior. The most valuable part of the process was learning where the tool accelerated the work and where I still needed to slow down, inspect the system, and make the final decision.
