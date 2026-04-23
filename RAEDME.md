# Student QR Info — Backend API

Backend platform for managing student data, certificates, and welder qualification records with QR-based identification.

---

## Tech Stack

- **Runtime:** Node.js v22
- **Framework:** Express.js v5
- **Database:** PostgreSQL (partitioned tables by year)
- **ORM:** Drizzle ORM
- **Cache:** Redis
- **Auth:** JWT (access + refresh tokens)
- **File Upload:** Multer
- **Scheduler:** node-cron
- **Package Manager:** pnpm

---

## Project Structure

```
src/
├── controllers/       # Route handlers
├── services/          # Business logic
├── repositories/      # Database queries
├── routes/            # Express routers
├── middlewares/       # Auth, error handler, file upload
├── db/                # Drizzle schema, DB connection, Redis, partitions
├── enums/             # Role, status constants
├── helpers/           # JWT, query builder, response utils
├── errors/            # Custom error class
└── jobs/              # Cron jobs
```

---

## API Endpoints

### Auth — `/api/auth`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/login` | Login |
| POST | `/refresh-token` | Refresh access token |

### Users — `/api/users`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | ✅ | Get all users |
| GET | `/me` | ✅ | Get current user |
| GET | `/:id` | ✅ | Get user by ID |
| POST | `/create` | ✅ | Create user |
| PUT | `/update/:id` | ✅ | Update user |
| DELETE | `/delete/:id` | ✅ | Delete user |

### Students — `/api/students`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | ✅ | Get all students (paginated, filterable) |
| GET | `/stats/monthly` | ✅ | Monthly registration stats |
| GET | `/:id` | — | Get student by ID |
| POST | `/create` | ✅ | Create student (with photo upload) |
| POST | `/update/:id` | ✅ | Update student (with photo upload) |
| DELETE | `/delete/:id` | ✅ | Delete student |

### Welder Certificates — `/api/welder-certificates`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | ✅ | Get all certificates |
| GET | `/static-list` | ADMIN+ | Get static list |
| GET | `/:id` | ✅ | Get certificate by ID |
| POST | `/create` | ✅ | Create certificate |
| PUT | `/update/:id` | ADMIN+ | Update certificate |
| DELETE | `/delete/:id` | ✅ | Delete certificate |

---

## User Roles

| Value | Name |
|-------|------|
| `1` | Admin |
| `2` | Super Admin |

---

## Database

PostgreSQL with yearly range partitioning on the `students` table:

```sql
students         -- parent table
students_2024    -- partition for year 2024
students_2025    -- partition for year 2025
...
```

Partitions are created automatically on first insert for each year. Partition existence is cached in Redis for 7 days. Old partitions (5 years back) can be dropped via the service.

---

## Installation

```bash
git clone <repo-url>
cd backend
pnpm install
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=8000
JWT_SECRET="your_jwt_secret"
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
REDIS_URL="redis://:your_redis_password@localhost:6379"
```

---

## Database Setup

```bash
# Generate migration files
pnpm db:generate

# Run migrations
pnpm db:migrate

# Or push schema directly (dev only)
pnpm db:push

# Seed initial data
pnpm db:seed
```

---

## Development

```bash
pnpm start
```

Server runs on `http://localhost:8000` by default.
