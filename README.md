# VendX

## Project Overview

VendX is a streamlined, multi-vendor e-commerce platform designed to demonstrate a clean, efficient marketplace architecture. It solves the complexity often associated with setting up vendor-specific storefronts by providing a unified platform where users can seamlessly switch between buying products and managing their own sales.

This project was built for a hackathon to showcase how modern web technologies can deliver a performant, visually premium, and functional MVP in a short timeframe. It prioritizes tangible product flows, rapid vendor onboarding, and a non-custodial cryptocurrency payment integration over administrative feature bloat.

## Key Features

- **Multi-Vendor Product Listing:** A unified marketplace where products from various vendors are aggregated, searchable, and filterable.
- **Vendor Dashboard:** A dedicated, data-rich interface for vendors to manage inventory, view real-time sales statistics, track orders, and update store settings.
- **Cart and Checkout:** A persistent, synchronized shopping cart experience that handles multiple line items and calculates totals dynamically.
- **BCH Payment Flow:** A non-custodial Bitcoin Cash (BCH) payment integration allowing for direct, low-fee transactions without intermediate payment gateways.
- **Role-Based Access Control:** Distinct permission levels for Buyers, Vendors, and Admins, ensuring secure access to relevant features and API endpoints.

## System Architecture

The application follows a monolithic architecture leveraging Next.js App Router for both frontend rendering and backend API routes.

- **Frontend:** Server Components are used for initial data fetching and SEO, while Client Components handle interactive elements like the cart, forms, and dashboard charts.
- **API Layer:** A RESTful internal API (`/app/api`) acts as the interface between the client and the database. It handles authentication, validation, and business logic.
- **Database:** Data is persisted in a Neon (Serverless PostgreSQL) database, accessed via Prisma ORM for type-safe queries.

Data flows from the database through Prisma to the API routes, which return JSON to the client. State management on the client is handled via React Context (for Cart/Auth) and local state.

## Tech Stack Breakdown

- **Next.js (App Router):** Chosen for its unified framework capabilities, server-side rendering performance, and simplified routing structure.
- **Prisma ORM:** Selected for its developer experience, type safety, and efficient schema management, reducing the likelihood of runtime database errors.
- **Neon (PostgreSQL):** Used for its serverless scalability and instant branching capabilities, ideal for rapid prototyping and deployment.
- **Tailwind CSS:** Enables rapid UI development with utility-first styling, ensuring a consistent design system without context switching.
- **shadcn/ui:** Provides high-quality, accessible, and customizable components that accelerate UI development without sacrificing design control.
- **Zod:** Implements strict schema validation for API requests, ensuring data integrity at the system entry point.

## Pages & User Flows

1.  **Marketplace (`/`):** The landing page displaying featured products and categories. Users can browse and search the global catalog.
2.  **Product Detail (`/product/[id]`):** Comprehensive view of a product, including images, description, vendor info, and add-to-cart functionality.
3.  **Authentication (`/login`, `/signup`):** Standard flow for user registration and session management.
4.  **Cart (`/cart`):** Review selected items, adjust quantities, and proceed to checkout.
5.  **Vendor Dashboard (`/dashboard`):** Protected area for vendors.
    -   **Overview:** Stats cards (Revenue, Sales, Products) and recent activity.
    -   **Products:** CRUD operations for inventory.
    -   **Orders:** Order management and status updates (Pending -> Shipped).
    -   **Settings:** Store profile management.
6.  **Vendor Public Profile (`/vendors/[id]`):** A dedicated storefront page for a specific vendor showing their active listings.

## API Design Overview

The API follows a resource-oriented structure rooted in `app/api`.

-   **Authentication:** Endpoints are protected via session verification. Middleware ensures role compliance (e.g., only Vendors can access `/api/vendor/*`).
-   **Validation:** All write operations validate request bodies using Zod schemas. Invalid requests return structured 400 errors.
-   **Error Handling:** A standardized error response format is used across endpoints to ensure the frontend can gracefully handle failures.

## Database Design

The schema is defined in `schema.prisma`. Key models include:

-   **User:** Stores authentication details, roles (BUYER/VENDOR/ADMIN), and profile data.
-   **Product:** Represents inventory items, linked to a User (Vendor). specific fields for price, stock, and images.
-   **Order:** Represents a completed transaction. Linked to User (Customer).
-   **OrderItem:** Linking table between Orders and Products, capturing the price at the time of purchase.
-   **Address:** Stores shipping information for users.

Prisma and PostgreSQL were chosen to enforce relational integrity (Foreign Keys) which is critical for e-commerce consistency (e.g., preventing deletion of purchased products).

## Setup & Installation

### Prerequisites
- Node.js 18+
- PostgreSQL connection string (Neon recommended)
- Cloudinary account (for image uploads)

### Environment Variables
Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secure-secret"
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

### Installation Steps

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/vendx.git
    cd vendx
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Initialize the database:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

4.  Run the development server:
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:3000`.

## Project Structure

-   `app/`: Application source code (Pages, API routes, Layouts).
    -   `api/`: Backend logic.
    -   `dashboard/`: Vendor dashboard pages.
-   `components/`: Reusable UI components.
    -   `ui/`: Base shadcn elements (buttons, inputs).
    -   `dashboard/`: Specific components for the vendor area.
-   `lib/`: Utility functions (DB connection, Auth helpers, Formatters).
-   `prisma/`: Database schema and migrations.
-   `store/`: Zustand state management stores (Auth, Cart).

## Security & Limitations

-   **Authentication:** Uses JWT stored in HTTP-only cookies.
-   **Input Validation:** Strict Zod validation on all API inputs prevents injection and malformed data.
-   **Simplifications:**
    -   Two-Factor Authentication (2FA) is currently not implemented.
    -   Email verification is bypassed for the hackathon MVP.
    -   Inventory locking during checkout is optimistic.

## Future Improvements

-   **Reviews & Ratings:** Allow buyers to rate products and vendors.
-   **Real-time Inventory:** Use WebSockets to update stock levels on the frontend instantly.
-   **Advanced Crypto Payments:** Integrate automated transaction verification via blockchain listeners.
-   **Logistics Integration:** Connect with shipping APIs for real tracking numbers.

## Hackathon Notes

-   **Demo Assumptions:** The demo environment uses a test Cloudinary account and a seeded database. BCH payments are simulated or performed on mainnet with small amounts for verification.
-   **Known Limitation:** Image upload relies on client-side state for preview before submission; in a slow network, this might feel synchronous.
-   **Focus Area:** Judges should evaluate the seamless transition between the "Buyer" and "Vendor" views and the responsiveness of the dashboard data visualization.
