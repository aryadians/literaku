# Literaku Project Architecture

This document outlines the refactored architecture of the Literaku project, focusing on clear separation of concerns, consistent naming, and logical organization to enhance maintainability and scalability.

## 1. Directory Structure

The project follows a feature-first and domain-driven directory structure within the `app` and `components` directories, complemented by dedicated `lib` for utilities, `store` for state management, `types` for shared TypeScript definitions, and `database` for SQL schema and migrations.

```
literaku/
├── app/                      # Next.js App Router (pages and API routes)
│   ├── [locale]/             # Internationalized routes
│   │   ├── admin/            # Admin-specific pages
│   │   ├── auth/             # Authentication-related pages (login, register, OTP)
│   │   ├── canvas/           # Canvas feature pages
│   │   ├── dashboard/        # User dashboard pages
│   │   ├── library/          # Digital library pages
│   │   ├── read/             # PDF reader pages
│   │   ├── reviews/          # Book review pages
│   │   └── ...               # Other main application pages
│   └── api/                  # API Routes (Next.js API handlers)
│       ├── auth/             # Authentication API (e.g., NextAuth catch-all)
│       ├── books/            # Book-related API endpoints
│       ├── canvas/           # Canvas-related API endpoints
│       ├── debug/            # Debugging/monitoring endpoints
│       ├── profiles/         # User profile API endpoints
│       └── reviews/          # Review-related API endpoints
├── components/               # Reusable UI components
│   ├── ui/                   # Generic, "dumb" UI components (Button, Card, Input)
│   ├── layout/               # Layout-specific components (Header, Footer)
│   ├── providers/            # Context/Auth providers (AuthProvider, ThemeProvider)
│   └── features/             # Feature-specific, "smart" components
│       ├── canvas/           # Components related to the Canvas feature
│       ├── reader/           # Components related to the PDF Reader feature
│       └── ...               # Other feature-specific component groups
├── lib/                      # Utility and helper functions
│   ├── api/                  # API client configurations (Axios, custom fetchers)
│   ├── supabase/             # Supabase client instances (client, server, admin)
│   ├── fonts.ts              # Font definitions
│   ├── utils.ts              # General utility functions
│   └── constants.ts          # Application-wide constants
├── store/                    # Zustand centralized state management stores
│   ├── useAuthStore.ts
│   └── useReviewStore.ts
├── types/                    # Global TypeScript type definitions
│   ├── database.ts           # Supabase database interfaces
│   └── next-auth.d.ts        # NextAuth module augmentations
├── database/                 # SQL database schema and migration files
│   ├── schema.sql            # Main database schema definition
│   └── migrations/           # Individual SQL migration scripts
├── messages/                 # Internationalization message files
├── i18n.ts                   # Next-intl configuration file
├── middleware.ts             # Next.js middleware with next-intl configuration
├── public/                   # Static assets (images, icons)
└── ...                       # Root-level configuration, scripts, etc.
```

## 2. Standardized Naming Conventions

-   **Folders**: kebab-case (e.g., `lib-api`, `components-ui`).
-   **Files**: PascalCase for React components and types (e.g., `Button.tsx`, `Profile.ts`), camelCase for utility functions or specific implementations (e.g., `utils.ts`, `fetcher.ts`).
-   **API Routes**: Named descriptively based on the resource they manage (e.g., `app/api/reviews/route.ts` for review API).
-   **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_PAGE_SIZE`).

## 3. Consolidation of Functionality

-   **API Clients**: `lib/api` centralizes Axios configurations and fetcher utilities.
-   **Supabase Clients**: `lib/supabase` houses different Supabase client instances (`client`, `server`, `admin`) to ensure the correct client is used based on the execution environment (browser, server, API route with service role).
-   **Types**: All shared TypeScript interfaces are now consolidated under the `types/` directory, improving discoverability and reducing redundancy.

## 4. Separation of UI Components

-   **`components/ui`**: Contains highly reusable, presentation-only UI components that are unaware of business logic (e.g., `Button`, `Card`, `Input`).
-   **`components/features`**: Houses components that are specific to a particular feature or domain. These components may contain business logic or state relevant to their feature (e.g., `canvas/CanvasEditor`, `reader/ReaderInterface`).
-   **`components/layout`**: Dedicated to structural components that define the overall page layout (e.g., `Header`, `Footer`).
-   **`components/providers`**: Contains React Context Providers (e.g., `AuthProvider`, `ThemeProvider`) that wrap parts of the application to provide global state or services.

## 5. Organization of API Routes (`app/api`)

API routes are organized by resource to reflect RESTful principles and improve modularity. Each sub-folder corresponds to a specific domain (e.g., `auth`, `books`, `canvas`, `reviews`). This makes it easy to locate and manage endpoints related to a particular resource.

## 6. Structure of `lib` Directory

The `lib` directory is now structured into logical sub-folders:
-   **`lib/api`**: For all HTTP client configurations and data fetching utilities.
-   **`lib/supabase`**: For all Supabase client implementations.
-   **`lib/constants`**: For global application constants and configurations.
-   **`lib/utils`**: For general-purpose helper functions that don't fit into other categories.

## 7. Centralized State Management (`store`)

Zustand stores are kept in the `store/` directory, providing a clear location for global or shared application state.

## 8. Configuration Management

Configuration files (e.g., `next.config.ts`, `tailwind.config.ts`, `eslint.config.mjs`) remain at the root for ease of access and standard project setup. Application-specific constants are now centralized in `lib/constants.ts`.

## 9. Database Schema and Migrations (`database`)

All SQL files, including the main schema definition and individual migration scripts, are now consolidated under the `database/` directory.
-   **`database/schema.sql`**: Contains the full, up-to-date database schema.
-   **`database/migrations/`**: Stores individual migration scripts (`*.sql`) used for applying incremental changes to the database.

This architectural overview provides a standardized and organized foundation for further development and maintenance of the Literaku project.
