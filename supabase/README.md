# Supabase Database & Edge Functions

This folder contains the complete Supabase configuration for the Scan The Table application.

## 📁 Folder Structure

```
supabase/
├── config.toml              # Supabase CLI configuration
├── schema.sql               # Complete database schema (idempotent)
├── reset-schema.sql         # Cleanup script (drops all objects)
├── deploy-functions.sh      # Script to deploy all edge functions
├── README.md                # This file
├── functions/               # Edge functions
│   ├── _shared/
│   │   └── cors.ts          # Shared CORS headers
│   ├── create-razorpay-order/
│   ├── verify-razorpay-payment/
│   ├── generate-payment-url/
│   ├── create-tenant-user/
│   ├── update-tenant-user/
│   ├── razorpay-webhook/
│   ├── create-subscription-order/
│   ├── verify-subscription-payment/
│   └── process-plan-change/
└── migrations/              # Auto-generated migrations (read-only)
```

## 🚀 Deploying to a New Supabase Project

### Prerequisites

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Create a new Supabase project at https://supabase.com/dashboard

3. Get your project credentials from **Settings > API**:
   - Project URL
   - Anon/Public key
   - Service Role key (keep secret!)

### Method 1: SQL Editor (Recommended for Fresh Deploy)

This is the simplest method for a brand new project.

1. **Open Supabase Dashboard** → SQL Editor

2. **Run the schema**:
   - Copy the entire contents of `schema.sql`
   - Paste into SQL Editor
   - Click "Run"

3. **Deploy Edge Functions**:
   ```bash
   # Link your project
   supabase link --project-ref YOUR_PROJECT_ID
   
   # Deploy all functions
   chmod +x deploy-functions.sh
   ./deploy-functions.sh
   ```

### Method 2: CLI Migration Push

Use this if you want to track migrations over time.

1. **Update config.toml**:
   ```toml
   project_id = "your-new-project-id"
   ```

2. **Link to your project**:
   ```bash
   supabase link --project-ref your-new-project-id
   ```

3. **If you have conflicts** (existing policies/tables), run reset first:
   - Copy `reset-schema.sql` contents into SQL Editor
   - Run it to clean up existing objects
   
4. **Push migrations**:
   ```bash
   supabase db push
   ```

5. **Deploy Edge Functions**:
   ```bash
   ./deploy-functions.sh
   ```

### Method 3: Fresh Start (Reset + Schema)

Use this if you want a completely clean slate.

1. **In SQL Editor, run** `reset-schema.sql` first (WARNING: deletes all data!)

2. **Then run** `schema.sql`

3. **Deploy functions**:
   ```bash
   supabase link --project-ref YOUR_PROJECT_ID
   ./deploy-functions.sh
   ```

## ⚙️ Configure Secrets

After deploying, configure these secrets in **Supabase Dashboard > Project Settings > Secrets**:

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `SUPABASE_URL` | Your project URL | Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Settings > API |

## 🔧 Update Frontend Environment

Create/update your `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

## 📋 Edge Functions Reference

| Function | Auth Required | Description |
|----------|---------------|-------------|
| `create-razorpay-order` | Yes | Creates Razorpay order for customer food payments |
| `verify-razorpay-payment` | No | Verifies payment and creates order in database |
| `generate-payment-url` | Yes | Generates UPI payment URL/QR code |
| `create-tenant-user` | Yes | Creates new staff user for a tenant |
| `update-tenant-user` | Yes | Updates existing tenant staff user |
| `razorpay-webhook` | No | Handles Razorpay webhook events |
| `create-subscription-order` | Yes | Creates order for new tenant subscriptions |
| `verify-subscription-payment` | No | Verifies subscription payment, creates tenant |
| `process-plan-change` | Yes | Handles plan upgrades and downgrades |

## 🗃️ Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `tenants` | Multi-tenant restaurant businesses |
| `tenant_settings` | Per-tenant configuration |
| `orders` | Customer food orders |
| `profiles` | User profiles |
| `user_roles` | RBAC with roles: admin, tenant_admin, manager, chef, cook, waiter |
| `restaurant_tables` | Table management per tenant |
| `subscription_payments` | Platform subscription tracking |
| `platform_razorpay_config` | Platform-level Razorpay credentials |
| `razorpay_tenant_secrets` | Per-tenant Razorpay credentials |
| `global_settings` | Global application settings |
| `settings` | Legacy settings (backward compatibility) |

### Views

| View | Description |
|------|-------------|
| `public_settings` | Legacy compatibility view |
| `public_tenant_info` | Public tenant information |
| `public_tenant_settings` | Public tenant settings |

### Key Functions

| Function | Description |
|----------|-------------|
| `has_role(user_id, role)` | Check if user has specific role |
| `get_user_tenant_id()` | Get current user's tenant ID |
| `generate_order_id(tenant_id)` | Generate unique order ID |
| `get_orders_by_table(table_id, tenant_id)` | Get orders for a table |
| `create_new_tenant(...)` | Create new tenant with settings |

## 🔒 Security

All tables have Row Level Security (RLS) enabled with appropriate policies:

- **Universal Admin** (tenant_id = NULL): Full access to everything
- **Tenant Admin**: Full access to own tenant's data
- **Manager**: View/update tenant data, manage staff
- **Chef/Cook/Waiter**: View tenant data, update orders

## 🔄 Making Schema Changes

For ongoing development:

1. Create a new migration:
   ```bash
   supabase migration new your_migration_name
   ```

2. Edit the generated file in `migrations/`

3. Push changes:
   ```bash
   supabase db push
   ```

4. **Important**: After significant changes, update `schema.sql` to reflect the complete current state for fresh deployments.

## 🐛 Troubleshooting

### "Policy already exists" error
Run `reset-schema.sql` first, then `schema.sql`.

### "Relation already exists" error
The schema uses `IF NOT EXISTS` - this warning can be ignored.

### Edge function not working
1. Check if secrets are configured
2. Check function logs in Supabase Dashboard > Edge Functions
3. Verify JWT settings in `config.toml`

### Migration conflicts
If `supabase db push` fails:
1. Use SQL Editor method instead
2. Or run `reset-schema.sql` to clean up, then push

## 📞 Support

For issues specific to this project, check the main README.md in the project root.
