# 🛡️ National Cyber Crime Reporting Portal (Karnataka Region)
### BCA Final Year Project | Cloud-Backed Forensic Ledger & Incident Management System

A unified, production-ready web application designed for citizens to securely report digital crimes and for law enforcement agencies to track, audit, and resolve incidents across all 31 districts of Karnataka. 

This system operates on a decentralized architectural model, eliminating traditional server constraints by leveraging real-time cloud microservices.

---

## 🚀 Core Features

### 1. Unified Citizen Interface (`citizen.html`)
*   **Dynamic Forensic Form:** Captures victim details, crime categories, strict validation fields, and geographic distribution metrics.
*   **Multilingual Speech-to-Text (Feature 11):** Integrates native **Web Speech API** bindings allowing victims to dictate complex incidents in **ಕನ್ನಡ (Kannada)**, **हिन्दी (Hindi)**, **తెలుగు (Telugu)**, or **English**.
*   **Blob Storage Uploads:** Direct multi-mime evidence attachment processing straight to remote storage systems.
*   **Live Ledger Status Tracking:** Real-time state updates (Pending vs. Resolved) synchronized instantly via asynchronous state hooks.

### 2. Autonomous Authentication Gate (`auth.html`)
*   **JWT Session Security:** Uses cryptographic JSON Web Token handling to maintain stateful client sessions.
*   **Implicit Profile Router:** Interrogates structural relational models upon login to dynamically route traffic based on system privileges.

### 3. Cyber Command Center Dashboard (`admin.html`)
*   **Multi-Jurisdiction Super Admin View:** Provides comprehensive filtering capabilities mapping the entire administrative landscape of all 31 districts.
*   **State-Driven Real-time Analytics:** Automated counters parsing computational queries to provide instantaneous operational overviews.
*   **Forensic Deep-View Modal:** A dual-pane auditing canvas that isolates user metrics against high-resolution binary images and encrypted string payloads.

---

## ⚡ Backend-as-a-Service: Powered by Supabase

This project replaces traditional, high-maintenance server frameworks (like Node.js/Express with MongoDB) with **Supabase**, an enterprise-grade Backend-as-a-Service (BaaS) built on top of an open-source architecture.

### Why Supabase was Chosen for this Project:
1.  **Native PostgreSQL Core:** Unlike NoSQL databases, it uses a true relational database management system (RDBMS), ensuring absolute data integrity, strict table relationships, and lightning-fast search queries.
2.  **Instant Secure Authentication:** Handles robust, production-ready user registration and login flows using industry-standard JSON Web Tokens (JWT).
3.  **Scalable Object Storage:** Built-in CDN-backed asset storage allows high-resolution image and PDF attachments (evidence) to be securely saved under unique public URLs.
4.  **Auto-Generated PostgREST API:** Instantly maps database actions into safe client-side JavaScript functions, avoiding hundreds of lines of backend boiler-plate code.

---

## 📊 Database Schema & Cloud Setup (Supabase)

To link the web interface to the database infrastructure, log in to your **Supabase Dashboard** and execute the following configuration instructions:

### 1. Database Table Configurations
Go to the **SQL Editor** tab inside Supabase, paste this complete script, and click **Run**:

```sql
-- Create the RBAC User Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'district_admin', 'super_admin')),
  district TEXT
);

-- Create the Transactional Cyber Complaints table
CREATE TABLE complaints (
  id BIGSERIAL PRIMARY KEY,
  complaint_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users,
  user_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  crime_type TEXT NOT NULL,
  district TEXT NOT NULL,
  details TEXT NOT NULL,
  evidence_url TEXT DEFAULT 'None',
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);