# Protein Bae — Website, Orders, Payments & Admin System

A premium, responsive one-page site for **Protein Bae**, with a full order
pipeline: customer accounts, email notifications, payments, coupons,
reviews, and an admin dashboard with reports. Frontend is React + Vite +
Tailwind CSS v4; backend is Express + SQLite.

## Run it

Two terminals — one for the API, one for the site.

**1. API server**

```bash
cd server
npm install
cp .env.example .env
npm start          # or: npm run dev (auto-restarts on changes)
```

Runs on `http://localhost:4000`. `proteinbae.db` (SQLite) is created and
migrated automatically on first run.

To send real order emails, edit `server/.env` and set `SMTP_PASSWORD` to a
[Google App Password](https://myaccount.google.com/apppasswords) for the
Gmail account in `SMTP_USER`/`FROM_EMAIL` — never your real Gmail password.
**Without SMTP configured, orders and status changes still work exactly the
same; the server just logs a one-time warning and skips the email.**

If emails aren't arriving, check in this order:
1. **Does `server/.env` actually exist?** `server/.env.example` ships in
   the zip, but the server only reads `server/.env`. Run
   `cp .env.example .env` inside `server/` if you haven't, then restart.
2. **Restart the server after editing `.env`.** Node only reads it on boot.
3. **Check the server console on startup.** It logs one of:
   `[email] SMTP connected -- ready to send` (good), a config warning
   (`.env` missing/incomplete), or a connection error with the real reason
   (usually a bad password).
4. **`SMTP_PASSWORD` must be a Google App Password**, not your normal Gmail
   password — Gmail rejects normal passwords for SMTP. It requires
   2-Step Verification to be turned on for the account first, then you can
   generate one at the link above.
5. **Use Admin → Settings → "Send Test Email"** to fire a real email and
   see the exact error without needing to place an order.

**2. Website**

```bash
npm install
cp .env.example .env    # VITE_API_URL, defaults to localhost:4000/api
npm run dev
npm run build            # -> dist/
npm run lint
```

Admin panel: `/admin` (default password `proteinbae2026`, in
`server/.env.example` — **change it before deploying**).
Customer accounts: `/login`, `/register`, `/my-orders`.

## What's in the box

### Customer-facing
- **Checkout** collects name, email and a 10-digit phone number (validated
  on both ends); pickup time is chosen from a dropdown of slots generated
  from the active truck's hours (opens+30min .. closes−30min), never free
  text, and the backend re-validates whatever's submitted regardless.
- **Item customization** — if a menu item has listed ingredients, the
  customer can uncheck ones they don't want when adding it to their order
  (e.g. "no onions"); free-form items just get a notes field. This travels
  with the order line into the kitchen view and the confirmation email.
- **Coupons** at checkout — validated and priced entirely server-side.
- **Order confirmation** shows the assigned truck's name, phone (tap to
  call), pickup time and address as soon as the order is placed.
- **Order tracking** at `/track/:id` — a visual Received → Preparing →
  Ready → Completed timeline, plus the same truck/call info. Guests verify
  with the phone/email used on the order; logged-in customers see their
  own orders straight away.
- **Call the truck** — anywhere the truck appears (order confirmation,
  My Orders, tracking, the "Find Us" section) a tappable Call button uses
  that specific order's actual assigned truck number — never a hard-coded
  number, since the system supports more than one truck.
- **Accounts** (`/register`, `/login`) — bcrypt-hashed passwords, JWT
  sessions kept separate from admin sessions, phone validated the same way
  as checkout.
- **Forgot / Reset Password** (`/forgot-password`, `/reset-password`) —
  emails a single-use link that expires in 30 minutes; the response is
  identical whether or not the email exists, so accounts can't be
  enumerated; rate-limited per email+IP.
- **My Orders** (`/my-orders`) — a customer's own order history and detail
  view, with a 1–5 star review form once an order is Completed.
- **Partner With Us** and **Contact Us** — real forms (not dead buttons)
  with phone/email validation and a genuine success state after the
  request actually saves to the database.
- **Welcome popup** — shown once per browser session (via
  `sessionStorage`), not on every page navigation.
- **Product images** — every product card, the Hero collage, About Us and
  the truck section have real `<img>` slots with clearly-labelled
  placeholder art in `src/assets/images/`; drop in real photos with the
  same filenames to replace them (menu item photos are set per-product in
  Admin → Menu instead, since those come from the database).
- **Unavailable products** show "Currently Unavailable" and can't be added
  to an order — enforced again on the backend regardless of what the
  browser sends.

### Admin (`/admin`)
- **Dashboard** — today's orders/revenue/pending/completed/unpaid/partial,
  collection by payment method, with Today / Yesterday / This Week /
  This Month / Custom filters.
- **Orders** — every order lands here live (polling every 8s); one tap to
  advance status, open full detail + record a payment, see which truck
  it's assigned to, or tap a customer's phone number to call them
  directly.
- **New Order** — ring up a walk-in/phone order; only shows products
  currently marked available.
- **Payments** — outstanding vs. paid orders at a glance; "Make Payment"
  opens the same detail/payment panel as Orders.
- **Reports** — revenue by payment method, unpaid/partial totals,
  cancelled/completed counts, best-selling products, same date filters.
- **Food Trucks** — add, edit, and delete multiple trucks (name, phone,
  address, coordinates, hours); exactly one is ever "active" (the one
  shown to customers and assigned to new orders) — activating one
  automatically deactivates the rest.
- **Menu** — full editor: add, edit, delete, and toggle availability for
  products, including the ingredient list customers can customize and an
  image URL. Changes apply immediately, no server restart needed.
- **Partnerships** — every "Partner With Us" submission, with one-tap
  status changes (New / Contacted / Closed) and tap-to-call/email.
- **Contact Messages** — every Contact Us submission, with status changes
  (New / Read / Replied / Closed).
- **Settings** — coupon management (create/activate/deactivate), a "Send
  Test Email" tool to diagnose SMTP without placing an order, and a note
  on where the admin password/JWT secret/SMTP credentials live.

## How money and emails stay trustworthy

- **Prices**: every order re-prices itself from the `menu_items` table —
  a tampered price sent from the browser is ignored. Unavailable items are
  rejected server-side too, not just greyed out in the UI.
- **Discounts**: `POST /api/coupons/validate` recomputes the discount
  server-side from the coupon's actual rules (type, min order, dates,
  usage limit); the checkout only ever *displays* what the server said.
- **Payments**: `paid`/`remaining`/`UNPAID`/`PARTIAL`/`PAID` are derived
  from the `payments` table on every request, never trusted from the
  client. Recording a payment that would exceed the remaining balance is
  rejected with the remaining amount in the error message.
- **Phone numbers**: every phone field (checkout, registration,
  partnership/contact forms, admin manual orders) is checked against
  "exactly 10 digits" on both the form and the API — a request that
  slips past the frontend still gets rejected server-side.
- **Pickup time**: the dropdown of selectable times is generated from the
  active truck's hours, but the server independently re-derives the valid
  window and rejects anything outside it — a hand-crafted request can't
  submit an out-of-window time.
- **Password resets**: only a SHA-256 hash of the reset token is ever
  stored; the token is single-use (verified: reusing it fails), expires in
  30 minutes, and the forgot-password endpoint responds identically
  whether or not the email exists, so accounts can't be enumerated.
- **Emails**: failures never block order creation or a status update —
  the API responds successfully either way and reports `emailSent` /
  `emailWarning` so the UI can say so. Re-selecting the same status twice
  in a row is a no-op (no duplicate email, no duplicate DB write).
- **Reviews**: only the order's own logged-in customer, only once
  `status = completed`, only one review per order — enforced server-side.
- **Ownership**: a customer's `/api/customer/orders` and
  `/api/customer/orders/:id` routes only ever return rows where
  `customer_id` matches their JWT — verified by test (Customer B gets a
  404 on Customer A's order, not their data).

## Project structure

```
server/
  index.js                 Express app, mounts every router
  db.js                    SQLite schema + migrations (safe to re-run)
  services/
    email.js                 Nodemailer: order confirmation, status, and password-reset emails
    coupons.js                Coupon validation (server is the source of truth)
    payments.js                paid/remaining/status derived from the payments table
    dateRange.js                today/yesterday/week/month/custom -> SQL bounds
    pickup.js                    opens+30min .. closes-30min window + slot generation
    phone.js                      shared 10-digit phone validation
    password.js                    shared password-strength validation
    passwordReset.js                secure token generation + in-memory rate limiter
    trucks.js                        active-truck lookups (only one truck active at a time)
    menu.js                           menu_items table access (admin edits apply live)
    orderSerializer.js                 shared order shape incl. joined truck info
  middleware/
    auth.js                    admin login + JWT check
    customerAuth.js              customer JWT check (separate secret scope, same JWT_SECRET but distinct "role")
  routes/
    orders.js                  create/list/detail/status, pricing, coupon + pickup + phone validation, emails
    payments.js                  record + list payments for an order
    reviews.js                    POST /api/orders/:id/review
    customerAuth.js                register/login/me/forgot-password/reset-password
    customerOrders.js               my-orders list/detail + guest tracking
    coupons.js                       validate (public) + admin create/list/toggle
    dashboard.js                      GET /api/dashboard
    reports.js                         GET /api/reports
    trucks.js                           public active-truck GET + admin CRUD for multiple trucks
    menu.js                              public GET + admin add/edit/delete products
    partnerships.js                       public submit + admin list/status
    contact.js                             public submit + admin list/status
    admin.js                                admin login, SMTP test-email
  data/menu.json              one-time seed for menu_items on first boot only

src/
  context/
    CartContext.jsx           cart state used by the menu + checkout drawer
    CustomerAuthContext.jsx     customer login state, shared across the site
  assets/images/                 placeholder photos -- replace by filename, see "Images" below
  components/                 public site sections (Hero, Menu, TruckLocation, Partnerships, ...)
  components/ui/                RingBadge, SwooshDivider, DishArt, TruckMap, OrderStatusTimeline, OrderSummaryCard, Reveal
  pages/customer/                Login, Register, ForgotPassword, ResetPassword, MyOrders, CustomerOrderDetail, TrackOrder
  pages/admin/                    AdminLogin, AdminDashboard + one panel per tab (incl. TrucksPanel, PartnershipsPanel, ContactPanel)
  services/api.js                  every fetch call to the server above
```

## Images

Placeholder photos live in `src/assets/images/`, each labelled with what it
is and "Replace this file with a real photo". Drop in a same-named file to
swap it — no code changes needed:

| File | Used in |
|---|---|
| `protein-salad-bowl.jpg`, `protein-wrap.jpg`, `protein-shake.jpg` | Hero collage |
| `about-us.jpg` | About Us |
| `food-truck.jpg` | Find Protein Bae Near You |
| `partnership.jpg` | Partnerships section background |
| `hero.jpg` | Spare — not currently wired into the layout, kept in case a full-width hero photo is added later |

Menu item photos work differently, since products live in the database:
set the **Image URL** field in Admin → Menu (a hosted image link) instead
of editing a file. Leave it blank to keep the illustrated placeholder art.

## Design notes

- Palette & type live as CSS variables in `src/index.css` (`@theme`).
- `RingBadge` (the logo's yellow ring) and `SwooshDivider` (the bowl's rim
  curve) are the recurring signature shapes tying every section back to
  the logo, instead of generic dividers.
- `DishArt` renders on-brand placeholder illustrations for menu items
  since no food photography was supplied. Swap in real photos later by
  adding an `image` field to `server/data/menu.json` and rendering an
  `<img>` in `Menu.jsx`.

## Testing performed

The full backend was exercised end-to-end via the API before this build
was packaged: order creation (with/without coupon), phone validation
(9/11-digit and non-numeric rejected), pickup-time window enforcement
(matches the spec's own 10:00 AM–8:00 PM example exactly), unavailable
products rejected server-side, the multi-truck migration and activation
switching, orders correctly carrying the active truck's name/phone through
to confirmation/tracking, the no-op-on-repeat-status-email rule,
PARTIAL → PAID payment transitions, overpayment rejection, customer
registration/login, cross-customer order isolation, review eligibility
rules (completed-only, one-per-order, ownership), a full forgot/reset
password cycle (weak password rejected, mismatch rejected, successful
reset, old password stops working, token can't be reused), partnership
and contact form submission + admin status updates, and dashboard/report
totals against known seed data. Email sending itself can't be verified
without real Gmail credentials — everything upstream and downstream of
the `sendMail()` call is tested; add your App Password to confirm
delivery.

## Not built (out of scope / left as-is)

- Refund workflow beyond the `REFUNDED` payment-status value existing in
  the schema.
- Payment gateway integration — payments are recorded as received
  (cash/UPI/card at pickup), not processed online.
- Multi-truck customer-facing display — the site still shows one "Find
  Us" location (the currently active truck); Admin → Food Trucks supports
  managing several, but customers don't yet pick between multiple
  simultaneously-open trucks.

## Logo usage

Untouched original at `src/assets/logo.jpeg`. `src/assets/logo-mark.png`
is a crop of just the circular icon (no wordmark) for small sizes —
cropping only, no redesign.
