## drynest-core

NestJS service for Drynest. This document explains how contributors can set up the project locally.

### Prerequisites

- **Node.js**: v24.x (use `nvm use`)
- **npm**: comes with Node 24
- **PostgreSQL**: 13+ running locally or accessible remotely
- **OpenSSL**: for generating RSA keys for JWT (RS256)

### Quick start

1. Clone and install dependencies

```bash
git clone https://github.com/<org>/drynest-core.git
cd drynest-core
nvm use
npm ci
```

2. Create a `.env` file in the project root

Use the template below. You must provide PostgreSQL credentials and RSA keys for JWT.

```env
# App
PORT=3001

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=drynest_core

# JWT (RS256). Keep on a single line with \n for newlines
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n<base64>\n-----END PRIVATE KEY-----"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n<base64>\n-----END PUBLIC KEY-----"
```

3. Create the database (example for local Postgres)

```bash
createdb drynest_core || true
```

4. Run database migrations

```bash
npm run migration:run
```

If you encounter an error about `uuid_generate_v4()`, enable the Postgres extension and rerun:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

5. Seed an allowed admin email (required to sign up first admin)

Because all non-auth routes are protected by a global guard, you must pre-seed an email in the `allowed_admins` table before using the signup API.

```sql
-- Connect to your database then run:
INSERT INTO allowed_admins (email) VALUES ('you@example.com');
```

6. Start the server in watch mode

```bash
npm run start:dev
```

- API base path: `http://localhost:3001/api/v1`
- Swagger docs: `http://localhost:3001/api/v1/docs`

### Generating RSA keys for JWT

```bash
# Generate a 2048-bit RSA private key and corresponding public key
openssl genrsa -out jwt_private.pem 2048
openssl rsa -in jwt_private.pem -pubout -out jwt_public.pem

# Convert to single-line .env friendly format (escape newlines)
awk 'BEGIN{ORS="\\n"} {gsub(/\r?\n/, "\\n"); printf "%s", $0}' jwt_private.pem | sed 's/.*/"&"/'
awk 'BEGIN{ORS="\\n"} {gsub(/\r?\n/, "\\n"); printf "%s", $0}' jwt_public.pem | sed 's/.*/"&"/'

# Paste outputs into JWT_PRIVATE_KEY and JWT_PUBLIC_KEY respectively
```

The application replaces `\n` with real newlines internally, so the quoted single-line values will work.

### Common scripts

```bash
# Build
npm run build

# Lint & format
npm run lint
npm run format

# Run
npm run start           # dev (non-watch)
npm run start:dev       # dev watch
npm run start:prod      # run compiled dist

# Tests
npm run test            # unit
npm run test:e2e        # e2e
npm run test:cov        # coverage

# TypeORM
npm run migration:generate -- src/migrations/<name>
npm run migration:create -- src/migrations/<name>
npm run migration:run
npm run migration:revert
```

### Contributing

- Create a feature branch from the relevant base branch
- Ensure `npm run lint` and `npm test` pass locally
- Run `npm run build` to ensure the project compiles
- Push your branch and open a PR

### Troubleshooting

- **JWT config not found / invalid token**: Ensure `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY` are present in `.env` and formatted as single-line strings with `\n` escapes.
- **DB connection errors**: Verify `DATABASE_*` vars and that the database exists and is reachable.
- **uuid_generate_v4() does not exist**: Run `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` on your database, then re-run migrations.
- **Wrong Node version**: Run `nvm use` (Node 24 is required).
