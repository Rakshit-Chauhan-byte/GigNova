# GigNova Backend

## Setup

```bash
cd backend
npm install
npm run db:push
npm run db:seed
npm run dev
```

## API Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | – | Register student or business |
| POST | `/api/auth/login` | – | Login |
| GET | `/api/auth/me` | ✅ | Get current user |
| PUT | `/api/auth/change-password` | ✅ | Change password |

### Student
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/student/profile` | STUDENT | Get own profile |
| PUT | `/api/student/profile` | STUDENT | Update profile |
| POST | `/api/student/profile/picture` | STUDENT | Upload profile picture |
| GET | `/api/student/dashboard` | STUDENT | Dashboard stats |
| GET | `/api/student/profile/:id/public` | Any | Public student profile |

### Business
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/business/profile` | BUSINESS | Get own profile |
| PUT | `/api/business/profile` | BUSINESS | Update profile |
| POST | `/api/business/profile/logo` | BUSINESS | Upload logo |
| POST | `/api/business/verification` | BUSINESS | Submit verification |
| GET | `/api/business/dashboard` | BUSINESS | Dashboard stats |
| GET | `/api/business/profile/:id/public` | Any | Public business profile |

### Gigs
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/gigs` | Any | List/search gigs |
| GET | `/api/gigs/categories` | Any | List categories |
| GET | `/api/gigs/business/mine` | BUSINESS | Own gigs |
| GET | `/api/gigs/:id` | Any | Gig details |
| POST | `/api/gigs` | BUSINESS | Create gig |
| PUT | `/api/gigs/:id` | BUSINESS | Update gig |
| DELETE | `/api/gigs/:id` | BUSINESS/ADMIN | Delete gig |
| GET | `/api/gigs/:id/applications` | BUSINESS | Gig applications |

### Applications
| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/api/applications` | STUDENT | Apply to gig |
| GET | `/api/applications/mine` | STUDENT | My applications |
| PATCH | `/api/applications/:id/withdraw` | STUDENT | Withdraw |
| PATCH | `/api/applications/:id/status` | BUSINESS | Update status |
| GET | `/api/applications/:id` | STUDENT/BUSINESS/ADMIN | Application details |

### Matching
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/match/recommendations` | STUDENT | Recommended gigs |
| GET | `/api/match/score/:gigId` | STUDENT | Match score for a gig |

### Reports
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/reports` | ✅ | Submit report |
| GET | `/api/reports/mine` | ✅ | My reports |

### Admin
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/admin/stats` | ADMIN | Dashboard stats |
| GET | `/api/admin/users` | ADMIN | All users |
| GET | `/api/admin/users/:id` | ADMIN | User details |
| PATCH | `/api/admin/users/:id/suspend` | ADMIN | Suspend/unsuspend |
| DELETE | `/api/admin/users/:id` | ADMIN | Delete user |
| POST | `/api/admin/users/admin` | ADMIN | Create admin |
| GET | `/api/admin/gigs` | ADMIN | All gigs |
| PATCH | `/api/admin/gigs/:id/suspend` | ADMIN | Suspend/unsuspend gig |
| GET | `/api/admin/reports` | ADMIN | All reports |
| PATCH | `/api/admin/reports/:id/status` | ADMIN | Update report status |
| GET | `/api/admin/verifications` | ADMIN | Verification requests |
| PATCH | `/api/admin/verifications/:id/review` | ADMIN | Approve/reject verification |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `file:./dev.db` | SQLite path |
| `JWT_SECRET` | (set in .env) | JWT signing secret |
| `JWT_EXPIRES_IN` | `7d` | Token expiry |
| `PORT` | `5000` | Server port |
| `FRONTEND_URL` | `http://localhost:5173` | CORS origin |
| `NODE_ENV` | `development` | Environment |
