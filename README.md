# Shop ERP System

Full-stack shop management ERP built with React, Express, TypeScript, and MongoDB.

## Features

- JWT authentication with admin/staff permissions
- Products, categories, suppliers, and customers
- Stock-aware sales: recording a sale deducts stock; refunds restore it
- Live dashboard totals, recent sales, and monthly revenue

## Run locally

1. Configure `backend/.env` with your MongoDB URI and a strong JWT secret. Change the default administrator password before production use.
2. Start the backend: `cd backend` then `npm.cmd run dev`
3. Start the frontend in another terminal: `cd frontend` then `npm.cmd start`
4. Open `http://localhost:3000` and sign in with the configured admin credentials.

The first backend launch creates the configured administrator if it does not already exist.

## Demo data

After MongoDB is reachable, add safe-to-rerun sample data with:

```powershell
cd backend
npm.cmd run seed:demo
```

This adds demo categories, suppliers, customers, products, and sales. Demo products use `DEMO-` SKUs and demo sales use `DEMO-` numbers, so they are easy to identify.

## CI/CD

GitHub Actions validates backend and frontend builds on pull requests and pushes to `main`.

Creating a version tag (for example, `v1.0.0`) or manually running **Release Artifacts** builds production-ready backend and frontend artifacts. The release job uses the GitHub `production` environment, so configure its protection rules in the repository settings before use. Download the resulting artifacts from the workflow run and deploy them to your chosen hosting provider.
