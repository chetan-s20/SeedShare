# 🌱 SeedShare - Enhanced Seed Library & Marketplace

A unified digital ecosystem for seed sharing, expert guidance, and certified seed sales for farmers and urban gardeners.

## 🎯 Project Overview

SeedShare is a comprehensive Next.js application that provides:
- **Seed Library**: Peer-to-peer seed exchange with QR code tracking
- **Marketplace**: Certified seed sales from verified suppliers
- **Community Hub**: Q&A forums, localized groups, and success stories
- **Expert Consultation**: AI-powered assistance and live expert sessions
- **Gamification**: Points, badges, challenges, and leaderboards
- **Logistics Integration**: Multi-carrier delivery tracking

[View Wireframe Design](https://app.visily.ai/projects/8faef276-e3b5-4577-a0f2-ffeac6c5afdc/boards/2259576/presenter?play-mode=Prototype&startingPointId=998860115)

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend/Database**: Supabase (PostgreSQL, Auth, Storage, Realtime, RLS)
- **State Management**: Zustand, React Query
- **Forms**: React Hook Form + Zod validation
- **QR Codes**: qrcode library
- **Payment**: Razorpay/Stripe (test mode)
- **AI**: OpenAI API (for consultation bot)

## 📁 Project Structure

```
seedshare/
├── app/
│   ├── login/               # Login page
│   ├── signup/              # Signup page
│   ├── api/
│   │   ├── seeds/
│   │   ├── marketplace/
│   │   └── community/
│   ├── library/             # Seed library pages
│   ├── marketplace/         # Marketplace pages
│   ├── community/           # Community pages
│   ├── knowledge/           # Q&A forum
│   ├── experts/             # Expert consultation
│   ├── profile/             # User profile
│   ├── dashboard/           # User dashboard
│   ├── admin/               # Admin panel
│   ├── layout.tsx
│   └── page.tsx             # Homepage
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── layout/              # Navbar, Footer
│   ├── seed-library/        # Seed-related components
│   ├── marketplace/         # Marketplace components
│   └── community/           # Community components
├── lib/
│   ├── supabase/           # Supabase client config
│   └── utils.ts
├── types/
│   └── database.types.ts    # TypeScript types
├── hooks/                   # Custom React hooks
├── public/                  # Static assets
├── DATABASE_SCHEMA.md       # Complete database schema
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Supabase account
- (Optional) OpenAI API key
- (Optional) Razorpay/Stripe account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/chetan-s20/SeedShare.git
   cd SeedShare/seedshare
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.local` and fill in your values:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # OpenAI (Optional)
   OPENAI_API_KEY=your_openai_key

   # Payment Gateway (Optional)
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret

   # App Config
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up Supabase Database**

   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and run the SQL from `DATABASE_SCHEMA.md`
   - Create storage buckets: `seed-images`, `product-images`, `qr-codes`, `avatars`, `community-images`
   - Set up storage policies as described in DATABASE_SCHEMA.md

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

The complete database schema includes:

- **profiles** - User profiles with roles (farmer, gardener, expert, admin, supplier)
- **seeds** - Community seed library entries with QR codes
- **marketplace_products** - Certified seeds for sale
- **orders** - Purchase orders with tracking
- **seed_requests** - Peer-to-peer seed exchange requests
- **qa_posts** & **qa_answers** - Q&A forum
- **communities** - Localized community groups
- **consultations** - Expert consultation bookings
- **gamification** - Points and badges tracking
- **product_reviews** - Marketplace reviews

See `DATABASE_SCHEMA.md` for complete SQL schema and RLS policies.

## 🔐 Authentication

- Email/password authentication via Supabase Auth
- OAuth (Google) integration
- Role-based access control (RBAC)
- Protected routes with middleware
- Row Level Security (RLS) policies

## 📦 Key Features

### Seed Library
- List and browse community seeds
- QR code generation for provenance tracking
- Seed request/swap workflow
- Filter by category, origin, organic/heirloom status
- Upload multiple images per seed

### Marketplace
- Certified seed catalog
- Shopping cart and checkout
- Razorpay/Stripe payment integration
- Volume discounts
- Subscription boxes
- Product reviews and ratings
- Pincode serviceability check

### Community Hub
- Q&A forum with upvotes/downvotes
- Localized community groups by region
- Success stories sharing
- Real-time chat discussions (Supabase Realtime)

### Expert Consultation
- AI chat bot for instant answers
- Book live consultation slots
- Calendar integration
- Video meeting links
- Payment per session

### Gamification
- Points for activities (posting, sharing, helping)
- Badge system
- Seasonal challenges
- Leaderboards
- Progress tracking dashboard

### Logistics
- Multi-carrier selection (Delhivery, India Post, Ecom Express, Shiprocket)
- Order tracking
- Delivery status updates
- Compliance with Seeds Act regulations
- Packing and labeling guidance

### Admin Panel
- Approve/verify suppliers
- Content moderation
- Order management
- Dispute resolution
- Analytics dashboard

## 🎨 UI Components

Built with [shadcn/ui](https://ui.shadcn.com/):
- Button, Card, Input, Label
- Dialog, Tabs, Badge, Avatar
- Dropdown Menu, Select, Textarea
- Table, Separator, Sonner (Toast)

## 🔧 Development

### Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

### Code Structure Best Practices

- Use Server Components by default
- Add `'use client'` only when needed (forms, state, effects)
- Keep API routes in `app/api/`
- Use TypeScript for type safety
- Follow Next.js App Router conventions

## 📱 Responsive Design

- Mobile-first approach
- Responsive navigation
- Touch-friendly interfaces
- Optimized images

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### Other Platforms

- AWS Amplify
- Netlify
- Railway
- Self-hosted with Docker

## 📊 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `OPENAI_API_KEY` | OpenAI API key | No |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay key ID | No |
| `RAZORPAY_KEY_SECRET` | Razorpay secret | No |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, email support@seedshare.com or join our community forum.

## 🗺️ Roadmap

### Phase 1 (MVP) ✅
- [x] Project setup and configuration
- [x] Authentication system
- [x] Homepage with features
- [x] Database schema
- [x] Basic layout components

### Phase 2 (In Development)
- [ ] Seed library module
- [ ] Marketplace module
- [ ] Community features
- [ ] Payment integration
- [ ] QR code generation

### Phase 3 (Future)
- [ ] Expert consultation
- [ ] AI chat bot
- [ ] Mobile apps
- [ ] ONDC integration
- [ ] Advanced analytics

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Built with ❤️ for farmers and gardeners everywhere** 🌱
