# 🌱 SeedShare – AI-Powered AgriTech Marketplace

**SeedShare** is an **AgriTech e-commerce platform** that connects farmers, seed producers, and buyers within a unified ecosystem. It combines a **seed library**, a **product marketplace**, and **community forums** to share resources and knowledge. With AI-powered features, SeedShare provides personalized seed recommendations and intelligent search to help users discover the best seeds for their needs.

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-61DAFB?style=flat&amp;logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/Backend-Node.js-339933?style=flat&amp;logo=node.js" alt="Node.js"/>
  <img src="https://img.shields.io/badge/API-Express.js-000000?style=flat&amp;logo=express&amp;logoColor=white" alt="Express.js"/>
  <img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=flat&amp;logo=mongodb" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/AI-OpenAI-412991?style=flat&amp;logo=openai" alt="OpenAI"/>
  <img src="https://img.shields.io/badge/Supabase-03B53A?style=flat&amp;logo=supabase" alt="Supabase"/>
</p>

- **Live Demo:** [https://lnkd.in/e28JncwK](https://lnkd.in/e28JncwK)  
- **GitHub:** [github.com/chetan-s20/SeedShare](https://github.com/chetan-s20/SeedShare)
  

## 🚀 Key Features

- **Multi-Section Platform:** Combines a **seed library**, **marketplace**, and **community forum**, as described by the project team.
- **User Authentication:** Secure signup/login with JWT or Supabase Auth; profile and order history.
- **Product Catalog:** Browse and search seeds by category, crop type, and key attributes.  
- **Product Details:** View high-resolution images and descriptions for each seed product.
- **AI-Powered Recommendations:** Personalized seed suggestions via integrated AI (e.g., OpenAI GPT-4 or custom ML model) based on user preferences.  
- **Shopping Cart & Checkout:** Add seeds to a cart, apply quantities, and simulate checkout/payment flow.
- **Wishlist:** Save favorite seeds for later purchase.
- **Search & Filter:** Full-text search and filters (e.g., crop type, region) to quickly find seeds.
- **Admin Interface:** Backend endpoints for adding/editing/removing seed products, managing inventory, and processing orders.
- **Order Management:** Users can place orders and view their order status/history.
- **Responsive Design:** Frontend is fully responsive (desktop and mobile views).  

## 🗺️ Architecture Overview

```mermaid
flowchart LR
    U((User))
    U -->|Browse/Search| FE[React Frontend]
    FE -->|API Requests| BE[Express.js Backend]
    BE -->|CRUD Operations| DB[(MongoDB Database)]
    BE -->|Auth| Auth[(Auth Service)]
    BE -->|AI Call| AI[(OpenAI API)]
    FE -->|Recommendations| AI
    subgraph Cloud Platform
      FE
    end
```

```mermaid
flowchart TD
    A[Browse Seeds] --> B[View Product]
    B --> C[Add to Cart]
    C --> D[Checkout]
    B --> E[Add to Wishlist]
    A --> F[AI Recommendation] 
    F --> B
```

## 🛠️ Tech Stack

- **Frontend:** React.js (possibly with TypeScript or Next.js) and Tailwind CSS (for styling).  
- **Backend:** Node.js with Express.js framework.  
- **Database:** MongoDB (via Mongoose) is used for data persistence. *(Optional:* Supabase/PostgreSQL can be used instead – see below.)*  
- **AI / ML:** OpenAI GPT-4 or similar for intelligent seed recommendations.  
- **Authentication:** JSON Web Tokens (JWT) or Supabase Auth for user login/signup.  
- **APIs:** RESTful API design (e.g., `/api/seeds`, `/api/auth`, `/api/cart`, etc.).  
- **Deployment:** Deployed to Vercel/Netlify (frontend) and Render/Heroku (backend).  
- **DevOps:** GitHub for version control; optional CI/CD with GitHub Actions.  

*(As noted by the project description, the focus was on “Backend Development, Database Integration”, so the backend is robust and scalable. We also integrate modern tools like Supabase for future-proofing.)*  

## 📂 Project Structure

```
SeedShare/
├── client/                # React frontend source
├── server/                # Express backend source
│   ├── controllers/      # API endpoint logic
│   ├── models/           # Database models (User, Seed, Order, etc.)
│   ├── routes/           # Express route definitions
│   ├── middleware/       # Auth and error handling
│   ├── services/         # AI / external service integration
│   └── app.js            # Express app setup
├── .env                   # Environment variables
├── package.json           # Node.js dependencies
└── README.md              # Project documentation (this file)
```

## 💻 Installation & Setup

1. **Clone the repo:**  
   ```bash
   git clone https://github.com/chetan-s20/SeedShare.git
   cd SeedShare
   ```
2. **Install dependencies:**  
   ```bash
   # In root (for backend)
   npm install
   # In client/ (for frontend)
   cd client
   npm install
   ```
3. **Configure environment:** See [Environment Variables](#environment-variables) below.
4. **Run locally:**  
   ```bash
   # Start backend (default port 5000)
   npm start
   # Start frontend (default port 3000)
   cd client
   npm start
   ```
5. **Navigate:** Visit `http://localhost:3000` to view the app, and `http://localhost:5000/api` for API.

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```
# Backend (.env)
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/seedshare?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret

OPENAI_API_KEY=your_openai_api_key

# If using Supabase instead of MongoDB:
SUPABASE_URL=https://xyzcompany.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
DATABASE_URL=postgres://username:password@dbhost:5432/seedshare_db
```

For **Supabase integration**, replace the MongoDB database with a Supabase Postgres database. Example `.env` entries are shown above. Then migrate existing data or schema using Supabase CLI:

```bash
# Example Supabase migration commands
npx supabase init                # Initialize a new Supabase project
npx supabase db dump > dump.sql   # Dump current schema (if moving from Mongo)
npx supabase db reset             # Reset and seed the Supabase DB
```

## 🔌 API Endpoints (Summary)

- **Auth:**  
  `POST /api/auth/register` – Register a new user.  
  `POST /api/auth/login` – Authenticate and return JWT.  

- **Seeds:**  
  `GET /api/seeds` – Get list of all seed products.  
  `GET /api/seeds/:id` – Get details for a single seed.  
  `POST /api/seeds` – (Admin) Add a new seed product.  
  `PUT /api/seeds/:id` – (Admin) Update a seed.  
  `DELETE /api/seeds/:id` – (Admin) Remove a seed.  

- **Cart/Order:**  
  `POST /api/cart` – Add items to cart or create a new order.  
  `GET /api/cart` – View current cart or user’s orders.  

- **AI Recommendation:**  
  `POST /api/recommendation` – Get AI-generated seed recommendations based on user input or profile.  

- **Community Forum:** *(If implemented)*  
  `GET /api/posts` – List forum posts/questions.  
  `POST /api/posts` – Create a new forum post.  

*(Actual routes may vary; above are typical examples.)*

## 📊 Data Models

Example MongoDB schemas or tables:

- **User:** `{ _id, name, email, hashed_password, role, createdAt }`  
- **Seed (Product):** `{ _id, name, variety, description, imageURL, price, stock, category, tags, createdAt }`  
- **Order:** `{ _id, userId, items: [{ seedId, quantity, price }], totalPrice, status, createdAt }`  
- **Cart:** `{ _id, userId, items: [{ seedId, quantity }] }` *(if separate from Order)*  
- **ForumPost:** `{ _id, userId, title, content, createdAt }`  

*(These are illustrative. Adapt fields as needed.)*

## 💾 Deployment

- **Frontend (React App):** Deploy on Vercel or Netlify. For example:  
  ```bash
  # Using Vercel CLI
  vercel login
  vercel --prod
  ```
- **Backend (Express API):** Deploy on Render, Heroku, or similar. Example `render.yaml` snippet for Render:

  ```yaml
  services:
    - type: web_service
      name: seedshare-backend
      env: node
      buildCommand: npm install
      startCommand: npm start
  ```
  Set the environment variables (MONGODB_URI, JWT_SECRET, etc.) in the dashboard.  

- **Database:** Use a managed MongoDB (Atlas) or Supabase Postgres for production.  

- **Additional:** Ensure CORS is configured on the backend to allow frontend domain.

## 🧪 Testing & Linting

- **Unit Tests:** Add Jest or Mocha tests for API endpoints (not shown here).  
- **Linting:** Use ESLint/Prettier. For example:  
  ```bash
  npm run lint
  npm run format
  ```

## 🎯 Future Improvements

- **Payments:** Integrate real payment gateway (Stripe/PayPal) for processing orders.  
- **Enhanced AI:** Add an AI chatbot assistant for farming tips using OpenAI.  
- **Image Recognition:** Allow users to upload seed photos for automatic identification.  
- **User Profiles:** Richer profiles (user roles, history, preferences).  
- **Real-Time Chat/Forum:** Live chat or Q&A forum for community support.  
- **Multi-language:** Support for additional languages and regions.  
- **Mobile App:** Native mobile versions (React Native) for iOS/Android.

## 🤝 Contributors

- **Niharika Khosla** – ([LinkedIn](https://www.linkedin.com/in/niharika-khosla-95357b333/)) &ndash; *Project lead & front-end*  
- **Chetan Sharma** –  (GitHub: [chetan-s20](https://github.com/chetan-s20)) – *Data modeling & API development*  






By following this README template and checklist, SeedShare will present a polished, comprehensive overview to recruiters and users alike, highlighting its features, technology stack, and easy setup.  

**Sources:** Project description and highlights (Chetan Sharma’s portfolio), technology stack context.
