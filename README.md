# 🏥 Arogya Care — Hospital Admin Dashboard

[![React v18](https://img.shields.io/badge/React-v18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Modern_UI-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-Data_Viz-FF6384?style=for-the-badge&logo=recharts&logoColor=white)](https://recharts.org/)

An enterprise-grade, single-page application dashboard built with React, Vite, and Tailwind CSS. It enables hospital administrators to manage medical staff, coordinate active OPD token queues, catalog pharmacy stock, and configure diagnostic lab directories.

---

## ✨ Features

### 1. Verification-Aware Navigation
- **Onboarding Setup Lock**: Until a hospital is approved by the Super Admin, the sidebar navigation displays locks on operational tabs (**Scheduling**, **Live Queue**, **Analytics**, and **Settings**).
- **Onboarding Checklist**: If unapproved, the main dashboard shifts into a customized Setup Guide, instructing admins to configure their doctors, medicines, and lab test offerings.

### 2. Staff Onboarding (`/doctors`)
- Allows admins to onboarding clinical staff, specifying qualifications, consult fees, slot durations, and registration numbers.
- **Auto-Verification**: Doctors onboarded by an already approved hospital are instantly created in the `'VERIFIED'` state, while those added by unverified hospitals are marked `'PENDING'` awaiting Super Admin compliance review.

### 3. Lab Directory (`/lab-tests`)
- Provides controls to add and configure diagnostic lab tests (Complete Blood Count, MRI, ECG) categorized under Pathology, Radiology, Cardiology, etc.

### 4. Pharmacy Directory (`/medicines`)
- Allows admins to catalog medicines stocked in their pharmacy including stock count, dosage type, and pricing.
- **Pre-fill Alert Notice**: Displays a prominent callout highlighting how this pharmacy database optimizes automated prescription routing and smart inventory in future integrations.

### 5. Live OPD Board (`/live-board`) & Scheduling
- Track real-time patient queues, update token check-in status (Checked In, In Progress, Completed, Absent), and configure doctor roster timings.
- Displays billing charts and gross revenue statistics.

---

## 🏗️ Folder Structure

```
arogya_care_hospitaladmin/
├── 📁 src/
│   ├── 📁 assets/          # Static logos and image assets
│   ├── 📁 components/      # UI components (Sidebar, TopNav, Dialogs)
│   ├── 📁 hooks/           # useAuth context controller
│   ├── 📁 pages/           # Pages (Dashboard, Doctors, LabTests, Medicines)
│   └── 📁 services/        # Supabase and Axios API connectors
└── 📄 vite.config.js       # Vite build configurations
```

---

## ⚙️ Local Configuration
1. Install modules:
   ```bash
   npm install
   ```
2. Setup environment variables (`.env`):
   ```env
   VITE_API_URL=http://localhost:5000/api/v1/hospitaladmin
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Boot client server:
   ```bash
   npm run dev
   ```
