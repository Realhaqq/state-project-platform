# Niger State Ward Development Project Platform

A comprehensive civic platform for tracking development projects across Niger State's 274 wards, built with Next.js and modern web technologies.

## Features

- **Public Project Tracking**: Citizens can view and search development projects across all wards
- **Role-Based Access**: Publishers submit projects with passcode validation, admins moderate content
- **Hero Slider**: Rotating showcase of featured projects (4 images, 2-second intervals)
- **Latest Projects Carousel**: Recent projects display (3 at a time, 5-second cycles)
- **Advanced Search**: Filter by LGA, Ward, status, date range with full-text search
- **Project Management**: Complete lifecycle tracking from submission to completion
- **Community Engagement**: Public comments and reporting system with moderation
- **Quarterly Subscriptions**: Citizens subscribe for development reports
- **Admin Dashboard**: Comprehensive moderation and analytics tools
- **Data Export**: CSV exports for projects, subscriptions, and reports

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: Neon Postgres with Row Level Security
- **Authentication**: NextAuth.js with role-based access
- **UI**: Tailwind CSS + shadcn/ui components
- **File Upload**: Cloudinary integration
- **Email**: Resend for notifications
- **Charts**: Recharts for analytics
- **Forms**: React Hook Form + Zod validation

## Database Schema

The platform includes comprehensive data models for:
- **Geographic Data**: 25 LGAs, 274 Wards, Polling Units
- **User Management**: Role-based authentication (citizen, publisher, admin, super_admin)
- **Project Tracking**: Full project lifecycle with status history
- **Content Moderation**: Comments and reports with approval workflows
- **Subscriptions**: Quarterly report subscriptions with preferences
- **Audit Logging**: Complete activity tracking

## Getting Started

### Prerequisites

- Node.js 18+ 
- Neon Postgres database
- Cloudinary account
- Resend account (for emails)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd niger-state-platform
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment Setup**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Fill in your environment variables:
   - Database connection strings
   - NextAuth configuration
   - Cloudinary credentials
   - Resend API key
   - Admin seed credentials

4. **Database Setup**
   
   Run the SQL migration scripts in order:
   \`\`\`bash
   # Execute these scripts in your Neon database console
   scripts/01-create-lgas-and-wards.sql
   scripts/02-create-users-and-auth.sql
   scripts/03-create-projects-and-content.sql
   scripts/04-create-comments-and-reports.sql
   scripts/05-create-audit-and-indexes.sql
   \`\`\`
   pnpx prisma migrate dev --name init

5. **Cloudinary Setup**
   
   Create an upload preset named `niger-state-projects` in your Cloudinary dashboard with:
   - Mode: Unsigned
   - Folder: niger-state-projects
   - Allowed formats: jpg, jpeg, png, webp
   - Max file size: 5MB
   - Transformations: Auto quality, Auto format

6. **Start Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

   Visit [http://localhost:3000](http://localhost:3000)

## User Roles & Access

### Citizens (Default)
- View approved projects
- Search and filter projects
- Submit comments (with moderation)
- Report issues
- Subscribe for quarterly reports

### Publishers
- Elevate account with admin-provided passcode
- Submit projects for their assigned LGA/Ward
- Manage their project submissions
- View project analytics

### Admins
- Moderate projects, comments, and reports
- Manage users and assign roles
- Create publisher passcodes
- Export data as CSV
- View system analytics

### Super Admins
- Full system access
- Manage other admins
- System configuration
- Audit log access

## API Endpoints

### Public APIs
- `GET /api/projects/search` - Search projects with filters
- `POST /api/projects/[id]/comments` - Submit comments
- `POST /api/reports` - Submit reports
- `POST /api/subscriptions` - Subscribe for reports

### Protected APIs
- `POST /api/projects` - Submit projects (Publishers)
- `GET /api/admin/stats` - Dashboard statistics (Admins)
- `GET /api/admin/export` - Data export (Admins)
- `POST /api/admin/moderate` - Content moderation (Admins)

## Security Features

- **Row Level Security**: Database-level access control
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Zod schemas for all forms
- **File Upload Security**: Cloudinary validation and transformations
- **Audit Logging**: Complete activity tracking
- **Role-Based Access**: Granular permission system

## Deployment

### Vercel (Recommended)

1. **Connect Repository**
   - Import project to Vercel
   - Configure environment variables

2. **Database Migration**
   - Run SQL scripts in Neon console
   - Verify tables and data

3. **Domain Configuration**
   - Update NEXTAUTH_URL
   - Configure Cloudinary domains

### Manual Deployment

1. **Build Application**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Start Production Server**
   \`\`\`bash
   npm start
   \`\`\`

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Review the documentation

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Niger State Government Development Platform**  
Transparency • Accountability • Progress
