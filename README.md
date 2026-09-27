# ডেইলি স্ন্যাকস

Medigene IT বিভাগের (১০–২০ জন) প্রতিদিনের অফিস নাস্তা বাছাইয়ের ছোট অভ্যন্তরীণ ওয়েব অ্যাপ।
অ্যাডমিন প্রতিদিন ২–৩টা আইটেমের মেনু খোলেন, সবাই কাটঅফের আগে একটা বেছে নেন, আর কেউ না বাছলে
নিজের ডিফল্ট গ্রুপের (হেলদি/আনহেলদি) ডিফল্ট আইটেম পান।

## টেক স্ট্যাক

- **Next.js** (App Router, TypeScript, Server Components + Server Actions)
- **SQLite**: `@libsql/client` দিয়ে সরাসরি SQL, কোনো ORM নেই। লোকালে ফাইল (`local.db`), প্রোডাকশনে [Turso](https://turso.tech)
- **নিজস্ব লগইন**: Employee ID + পাসওয়ার্ড, `bcryptjs`, ডাটাবেসে সেশন, httpOnly কুকি
- **Tailwind CSS**, **zod**
- টেস্ট: Node-এর বিল্ট-ইন `node:test` (বাড়তি প্যাকেজ নেই)

## দরকার

- **Node.js ২২.১৮ বা নতুন**। `scripts/` আর `tests/`-এর `.ts` ফাইলগুলো Node নিজেই চালায় (বিল্ট-ইন TypeScript সাপোর্ট),
  তাই `tsx`/`ts-node` লাগে না। ভার্সন দেখতে: `node -v`

## লোকাল সেটআপ

```bash
npm install
cp .env.example .env.local
```

`.env.local` খুলে প্রথম অ্যাডমিনের তথ্য দিন (`DATABASE_URL=file:local.db` যেমন আছে তেমন থাকবে):

```
ADMIN_EMPLOYEE_ID=M2004003
ADMIN_NAME=আপনার নাম
ADMIN_PASSWORD=কমপক্ষে-৬-অক্ষর
```

তারপর:

```bash
npm run db:migrate      # টেবিল তৈরি (local.db)
npm run db:seed-admin   # প্রথম অ্যাডমিন (আগে থেকে অ্যাডমিন থাকলে কিছুই করে না)
npm run dev             # http://localhost:3000
```

প্রথম লগইনে নতুন পাসওয়ার্ড সেট করতে হবে। এরপর `.env.local` থেকে `ADMIN_PASSWORD` মুছে দিতে পারেন।

> `local.db` আর `.env*` ফাইল git-এ যায় না (`.gitignore` দেখুন); শুধু `.env.example` যায়।

## স্ক্রিপ্ট

| কমান্ড | কাজ |
| --- | --- |
| `npm run dev` | ডেভেলপমেন্ট সার্ভার |
| `npm run build` / `npm start` | প্রোডাকশন বিল্ড / চালানো |
| `npm run lint` | ESLint |
| `npm test` | `lib/menu.ts`-এর নিয়মের টেস্ট (in-memory ডাটাবেসে, `local.db`-তে হাত দেয় না) |
| `npm run db:migrate` | `db/migrations/`-এর যেসব ফাইল এখনো চলেনি সেগুলো চালায় |
| `npm run db:seed-admin` | env থেকে প্রথম অ্যাডমিন তৈরি |

`db:*` স্ক্রিপ্টগুলো `.env` আর `.env.local` পড়ে; কমান্ডের সামনে সরাসরি দেওয়া env মান এগুলোকে ছাপিয়ে যায়
(প্রোডাকশন অংশে এটা কাজে লাগবে)।

## অ্যাডমিনের প্রথম দিন

1. **অ্যাডমিন → নাস্তা**: আইটেম যোগ করুন (দাম জনপ্রতি বাজেটের বেশি হতে পারবে না; ছবি ঐচ্ছিক লিংক)।
2. **অ্যাডমিন → ইউজার**: সবার অ্যাকাউন্ট খুলুন (অস্থায়ী পাসওয়ার্ড; প্রথম লগইনে তারা বদলাবেন)। সাইনআপ পেজ নেই।
3. **অ্যাডমিন → মেনু**: তারিখ বাছুন, ২–৩টা আইটেম দিন (দুই গ্রুপ থেকেই অন্তত একটা), প্রতি গ্রুপে একটা ডিফল্ট দিন,
   খসড়া সেভ করে **মেনু খুলুন**।
4. কাটঅফের পর **সারাংশ** দেখে অর্ডার দিন; নাস্তা এলে মেনুতে **ডেলিভারি হয়েছে** চাপুন।
5. **অ্যাডমিন → সেটিংস**: বাজেট (এখন ৳৩০) আর ডিফল্ট কাটঅফ সময় (বাংলাদেশ সময়)।

## কীভাবে কাজ করে

মেনুর সব নিয়ম এক জায়গায়: [`lib/menu.ts`](lib/menu.ts)।

- **স্ট্যাটাস**: `draft → open → closed → delivered`। এছাড়া `open → draft` (কেউ বাছাই না করলে) আর
  `closed → open` (রি-ওপেন, ভবিষ্যতের নতুন কাটঅফ লাগে)। শুধু খসড়া মোছা বা এডিট করা যায়।
- **cron নেই, "lazy close"**: কোনো মেনু পড়া/লেখার আগে `ensureClosedIfPastCutoff()` চলে। কাটঅফ পার হয়ে গেলে
  একটা `db.batch`-এ মেনু `closed` হয়, আর যারা কিছু বাছেনি তাদের জন্য ডিফল্ট সারি (`is_default = 1`) বসে।
  তালিকা পেজগুলো (`closeExpiredMenus()`) একইভাবে সব মেয়াদোত্তীর্ণ মেনু বন্ধ করে।
- **খোলা মেনুতে ডিফল্ট সেভ হয় না**: হোম আর সারাংশে তাৎক্ষণিক হিসাব হয়; বন্ধের মুহূর্তে সেভ হয়।
  বন্ধের পর হিসাব আর বদলায় না (পরে কেউ নিষ্ক্রিয় হলেও না)।
- **দামের snapshot**: মেনু খোলার সময় আইটেমের দাম আর গ্রুপ `menu_options`-এ কপি হয়, তাই পরে আইটেম এডিট করলে
  পুরোনো মেনু/রিপোর্ট বদলায় না।
- **সময়**: ডাটাবেসে সব সময় ISO 8601 UTC। দেখানো আর ডিফল্ট কাটঅফ হিসাব Asia/Dhaka-তে (UTC+6, DST নেই) —
  [`lib/time.ts`](lib/time.ts)।
- **লগইন**: [`lib/auth.ts`](lib/auth.ts)। কুকিতে র‍্যান্ডম টোকেন, ডাটাবেসে শুধু তার SHA-256 হ্যাশ (৩০ দিন)।
  প্রতিটা পেজ আর Server Action শুরুতেই `requireUser()`/`requireAdmin()` ডাকে; [`proxy.ts`](proxy.ts) শুধু দেখে কুকি আছে কিনা।

## প্রজেক্ট কাঠামো

```
app/
  login/                 লগইন পেজ + login/logout action
  (app)/                 লগইন লাগে এমন সব পেজ (হেডার + নেভিগেশন লেআউট)
    page.tsx             হোম: আজকের মেনু, বাছাই, কাউন্টডাউন
    summary/ history/    সারাংশ, আগের মেনু
    account/             নিজের প্রোফাইল আর পাসওয়ার্ড
    admin/               মেনু, ইউজার, নাস্তা, সেটিংস, রিপোর্ট
components/              ফর্ম, বাটন, ব্যাজ, সারাংশ ইত্যাদি
lib/
  db.ts                  একটাই libSQL ক্লায়েন্ট
  auth.ts                সেশন, requireUser/requireAdmin
  menu.ts                মেনুর সব নিয়ম (টেস্ট করা)
  settings.ts time.ts format.ts validation.ts constants.ts form.ts password.ts
db/migrations/           SQL migration ফাইল
scripts/                 migrate.ts, seed-admin.ts
tests/                   menu.test.ts
proxy.ts                 কুকি না থাকলে /login-এ পাঠায় (Next 16-এ middleware-এর নতুন নাম)
```

কিছু কনভেনশন:

- সবসময় প্যারামিটারাইজড কোয়েরি (`sql` + `args`); SQL-এ কখনো মান জোড়া লাগানো হয় না।
- একসাথে সফল হতে হবে এমন একাধিক লেখা `db.batch([...], "write")`-এ।
- সব ইনপুট zod দিয়ে যাচাই; এরর বার্তা বাংলায়।
- `lib/menu.ts` আর যেসব `lib` ফাইল সে ব্যবহার করে (`db`, `settings`, `time`, `format`, `constants`) একে অপরকে
  `./x.ts` দিয়ে import করে, `@/lib/...` দিয়ে নয়, যাতে Node সরাসরি (টেস্ট/স্ক্রিপ্টে) চালাতে পারে।

## ডাটাবেসে পরিবর্তন (নতুন migration)

1. `db/migrations/`-এ পরের নম্বরে নতুন ফাইল বানান, যেমন `002_add_something.sql`। ফাইলের নামের ক্রমেই চলে।
2. লোকালে `npm run db:migrate`।
3. **আগে চলে যাওয়া migration ফাইল কখনো এডিট করবেন না**; সবসময় নতুন ফাইল।
4. প্রোডাকশনে ডিপ্লয়ের **আগে** Turso-তে migration চালান (নিচে দেখুন)।

## প্রোডাকশন: Turso + Vercel

### ১. Turso ডাটাবেস তৈরি (একবার)

```bash
brew install tursodatabase/tap/turso      # macOS; Linux: curl -sSfL https://get.tur.so/install.sh | bash
turso auth login                          # অ্যাকাউন্ট না থাকলে: turso auth signup
turso db create daily-snacks
turso db show daily-snacks --url          # -> DATABASE_URL (libsql://...)
turso db tokens create daily-snacks       # -> DATABASE_AUTH_TOKEN
```

টোকেন দিয়ে পুরো ডাটাবেস পড়া-লেখা যায়: git, চ্যাট বা কোডে রাখবেন না। ফাঁস হলে Turso থেকে বাতিল করে নতুন বানান।

### ২. Turso-তে migration আর প্রথম অ্যাডমিন (নিজের মেশিন থেকে)

কমান্ডের সামনে দেওয়া মান `.env.local`-কে ছাপিয়ে যায়, তাই লোকাল ডাটাবেসে হাত পড়বে না:

```bash
DATABASE_URL="libsql://..." DATABASE_AUTH_TOKEN="..." npm run db:migrate

DATABASE_URL="libsql://..." DATABASE_AUTH_TOKEN="..." \
  ADMIN_EMPLOYEE_ID="M2004003" ADMIN_NAME="..." ADMIN_PASSWORD="..." \
  npm run db:seed-admin
```

### ৩. Vercel-এ ডিপ্লয়

1. কোড GitHub-এ push করুন, Vercel-এ **Add New → Project** থেকে রিপোটা import করুন (Next.js নিজে থেকেই চিনবে)।
2. **Settings → Environment Variables**-এ দুটো মান দিন (Production):
   - `DATABASE_URL` = `libsql://...`
   - `DATABASE_AUTH_TOKEN` = টোকেন

   `ADMIN_*` মানগুলো Vercel-এ দরকার নেই।
3. গতির জন্য Vercel-এর function region আর Turso ডাটাবেসের region কাছাকাছি রাখুন
   (যেমন দুটোই সিঙ্গাপুর বা মুম্বাই): Vercel-এ **Settings → Functions → Region**।
4. **Deploy** চাপুন। এরপর থেকে main ব্রাঞ্চে push করলেই নতুন ডিপ্লয় হবে।

### ৪. পরের ডিপ্লয়গুলোতে

নতুন migration থাকলে **আগে** ধাপ ২-এর মতো Turso-তে `npm run db:migrate` চালান, তারপর push/ডিপ্লয় করুন।
নইলে নতুন কোড পুরোনো টেবিলে চলতে গিয়ে ভাঙতে পারে।

## সমস্যা হলে

- **"DATABASE_URL সেট করা নেই"**: `.env.local` আছে কিনা আর তাতে `DATABASE_URL=file:local.db` আছে কিনা দেখুন,
  তারপর `npm run dev` আবার চালান।
- **লগইন হচ্ছে না**: `npm run db:seed-admin` চালিয়েছেন কিনা দেখুন। Employee ID-তে বড়/ছোট হাতের অক্ষর
  কোনো ব্যাপার না। কেউ পাসওয়ার্ড ভুলে গেলে অ্যাডমিন **ইউজার** পেজ থেকে রিসেট করবেন।
- **মেনু খুলছে না**: এরর বার্তা পড়ুন। সাধারণত কাটঅফ পার হয়ে গেছে, কোনো আইটেম নিষ্ক্রিয়, বা দাম বাজেটের বেশি।
