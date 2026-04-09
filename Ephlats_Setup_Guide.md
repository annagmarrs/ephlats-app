# Ephlats App — Setup Guide
## For Anna: Everything you need to do before Claude Code starts building

This guide assumes you know nothing about backend development. Every step is written in plain English. Follow it in order. Do not skip steps.

**Estimated time to complete this guide: 1.5 to 2 hours**
**When to do this: TODAY — the reunion is April 17 and every day counts.**

---

## What You're Setting Up

You need three free accounts before Claude Code can build anything:

1. **Firebase** (Google) — this is the backend that stores everything: user accounts, messages, photos, the schedule
2. **GitHub** — where your app's code lives
3. **Vercel** — where the app is hosted and available on the internet

You also need to install two programs on your computer:
- **Node.js** — lets your computer run the app code
- **Claude Code** — the AI tool that builds the app

---

## STEP 1: Create a Google Account (if you don't already have one)

You almost certainly already have a Google account. If you use Gmail, you're good. Skip to Step 2.

If not: go to https://accounts.google.com/signup and create one. Use an email you'll remember.

---

## STEP 2: Set Up Firebase

Firebase is Google's service that acts as the brain of your app — it stores user data, photos, messages, and handles logins.

### 2.1 — Create a Firebase Project

1. Go to https://console.firebase.google.com
2. Sign in with your Google account
3. Click the big **"Create a project"** button
4. **Project name:** type `ephlats-2026`
5. Click **Continue**
6. When asked about Google Analytics: toggle it **OFF** (you don't need it)
7. Click **Create project**
8. Wait about 30 seconds. When it says "Your new project is ready," click **Continue**

You're now inside your Firebase project dashboard. It looks a little overwhelming — don't worry, you'll only need a few specific sections.

---

### 2.2 — Enable Email/Password Login

1. In the left sidebar, click **Authentication**
2. Click the **"Get started"** button
3. You'll see a list of "Sign-in providers." Click on **Email/Password**
4. Toggle **Enable** to ON (the first toggle — leave "Email link" off)
5. Click **Save**

Now enable Google login:
6. Back on the Sign-in providers list, click **Google**
7. Toggle **Enable** to ON
8. Under "Project support email," select your email address from the dropdown
9. Click **Save**

---

### 2.3 — Create the Database

1. In the left sidebar, click **Firestore Database**
2. Click **"Create database"**
3. When asked about security rules, select **"Start in production mode"**
   (Claude Code will set up the proper rules — this is fine)
4. Click **Next**
5. For the location, select **nam5 (United States)** — this gives you the best performance for US-based users
6. Click **Enable**
7. Wait about 30 seconds for it to set up

---

### 2.4 — Enable File Storage

This is where photos and PDFs will be stored.

1. In the left sidebar, click **Storage**
2. Click **"Get started"**
3. When asked about security rules, click **Next** (Claude Code handles the rules)
4. Keep the default storage location and click **Done**

---

### 2.5 — Enable Push Notifications

This is what lets you send announcements to all attendees' phones.

1. In the left sidebar, click the gear icon ⚙️ next to "Project Overview" at the very top
2. Click **Project settings**
3. Click the **Cloud Messaging** tab at the top
4. Scroll down to find **"Web Push certificates"**
5. Click **Generate key pair**
6. A long string of letters and numbers will appear — this is your **VAPID key**
7. **Copy it and paste it somewhere safe** (a notes app, a Google Doc — you'll need this in Step 6)

---

### 2.6 — Get Your Firebase Config Values

These are the credentials that let your app connect to Firebase. You'll need to copy these carefully.

1. Click the gear icon ⚙️ → **Project settings** again
2. Scroll down to the **"Your apps"** section
3. Click the **web icon** (it looks like this: `</>`)
4. Under "App nickname," type `ephlats-web`
5. Leave "Also set up Firebase Hosting" **unchecked**
6. Click **Register app**
7. You'll see a block of code that looks like this:

```
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "ephlats-2026.firebaseapp.com",
  projectId: "ephlats-2026",
  storageBucket: "ephlats-2026.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  measurementId: "G-XXXXXXXX"
};
```

8. **Copy all of these values and paste them into a document.** You'll need every single one in Step 6. Label them so you know what each one is.

9. Click **Continue to console**

---

### 2.7 — Create a Service Account (for the admin features)

This gives the app special "admin-level" access for things like sending push notifications to everyone.

1. Still in **Project settings**, click the **Service accounts** tab
2. Click **"Generate new private key"**
3. A warning will appear — click **"Generate key"**
4. A JSON file will automatically download to your computer. **Do not lose this file.**
5. Open the file in a text editor (on Mac: right-click → Open With → TextEdit)
6. Find these three values inside the file and copy them somewhere safe:
   - `"project_id"` — the value after it (e.g., `"ephlats-2026"`)
   - `"client_email"` — looks like `firebase-adminsdk-xxxxx@ephlats-2026.iam.gserviceaccount.com`
   - `"private_key"` — a very long string that starts with `-----BEGIN RSA PRIVATE KEY-----`

⚠️ **Important:** The private key contains the characters `\n` throughout it. When you copy it, keep those characters — don't replace them with actual line breaks. You'll paste it exactly as-is.

---

## STEP 3: Create a GitHub Account

GitHub is where your app's code is stored. Claude Code will push the code here, and Vercel (your hosting service) will pull from it automatically.

1. Go to https://github.com
2. Click **Sign up**
3. Enter your email address and create a username and password
4. Verify your email when they send you a confirmation
5. On the free plan is fine — don't pay for anything

---

## STEP 4: Create a Vercel Account

Vercel hosts your app and makes it available on the internet.

1. Go to https://vercel.com
2. Click **Sign Up**
3. Choose **Continue with GitHub** — this connects the two accounts automatically
4. Authorize Vercel to access your GitHub account when prompted
5. You're in. The free "Hobby" plan is all you need.

---

## STEP 5: Install Software on Your Computer

You need two programs installed on your computer.

### 5.1 — Install Node.js

Node.js lets your computer run the app code locally.

1. Go to https://nodejs.org
2. Click the big green button labeled **"LTS"** (Long Term Support) — do NOT click "Current"
3. Download and run the installer
4. Click through the installer with all the default settings (just keep clicking Next/Continue)
5. When it's done, **restart your computer**

To check it worked:
- On Mac: open the Terminal app (search for "Terminal" in Spotlight)
- On Windows: open "Command Prompt" (search for it in the Start menu)
- Type: `node --version` and press Enter
- You should see something like `v20.11.0` — any number is fine as long as something appears

### 5.2 — Install Claude Code

Claude Code is the AI tool that will actually build the app for you.

1. Open Terminal (Mac) or Command Prompt (Windows)
2. Type the following and press Enter:
   ```
   npm install -g @anthropic-ai/claude-code
   ```
3. Wait for it to finish installing (takes about 1 minute)
4. Type `claude --version` and press Enter — you should see a version number

If you get an error at any point during these installs, take a screenshot and share it — setup errors are almost always fixable in 2 minutes.

---

## STEP 6: Set Up Your Environment Variables File

This file holds all your secret credentials. Claude Code needs this file to build the app correctly.

1. On your computer, create a new folder somewhere easy to find — call it `ephlats-app`
2. Inside that folder, create a new text file called `.env.local`
   - On Mac: open TextEdit, go to Format → Make Plain Text, then save the file as `.env.local` inside your ephlats-app folder
   - On Windows: open Notepad, save the file as `.env.local` (make sure "Save as type" is "All files," not "Text files")
3. Paste the following into the file, replacing every `PASTE_YOUR_VALUE_HERE` with the values you saved in Steps 2.6 and 2.5:

```
NEXT_PUBLIC_FIREBASE_API_KEY=PASTE_YOUR_VALUE_HERE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=PASTE_YOUR_VALUE_HERE
NEXT_PUBLIC_FIREBASE_PROJECT_ID=PASTE_YOUR_VALUE_HERE
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=PASTE_YOUR_VALUE_HERE
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=PASTE_YOUR_VALUE_HERE
NEXT_PUBLIC_FIREBASE_APP_ID=PASTE_YOUR_VALUE_HERE
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=PASTE_YOUR_VALUE_HERE
NEXT_PUBLIC_FCM_VAPID_KEY=PASTE_YOUR_VALUE_HERE

FIREBASE_ADMIN_PROJECT_ID=PASTE_YOUR_VALUE_HERE
FIREBASE_ADMIN_CLIENT_EMAIL=PASTE_YOUR_VALUE_HERE
FIREBASE_ADMIN_PRIVATE_KEY="PASTE_YOUR_PRIVATE_KEY_HERE"

NEXT_PUBLIC_APP_URL=https://ephlats-2026.vercel.app
```

⚠️ The private key line must have quotes around it (the `"` at the start and end of that line). Don't remove those quotes.

4. Save the file.

---

## STEP 7: Create a GitHub Repository

This is where your code will live.

1. Go to https://github.com and log in
2. Click the **+** icon in the top right → **New repository**
3. Repository name: `ephlats-app`
4. Leave it set to **Public** (easier for Vercel to connect)
5. Do NOT check "Add a README file" or anything else
6. Click **Create repository**
7. Copy the repository URL — it will look like `https://github.com/yourusername/ephlats-app`

---

## STEP 8: Hand Off to Claude Code

You are now ready to hand this project to Claude Code.

### How to start Claude Code

1. Open Terminal (Mac) or Command Prompt (Windows)
2. Navigate to your ephlats-app folder:
   - Type: `cd ` (with a space after cd)
   - Then drag your `ephlats-app` folder directly into the Terminal window — this auto-fills the path
   - Press Enter
3. Type `claude` and press Enter
4. Claude Code will open in your terminal

### What to say to Claude Code

Copy and paste this message exactly as written:

---

*I need you to build a production-ready PWA called "Ephlats 2026" for a Williams College a cappella reunion. The full product requirements are in the file at [PASTE THE FILE PATH TO YOUR Ephlats_App_Requirements.md FILE HERE].*

*I have already:*
- *Set up Firebase (Auth, Firestore, Storage, Cloud Messaging)*
- *Created GitHub repo at [PASTE YOUR GITHUB REPO URL HERE]*
- *Created a Vercel account (connected to GitHub)*
- *Placed .env.local in this folder with all credentials*

*Please:*
1. *Initialize the Next.js 14 project with TypeScript and Tailwind in this folder*
2. *Build the full app following the requirements spec exactly*
3. *Push to GitHub when complete*
4. *Provide instructions for connecting to Vercel and deploying*

*Follow the implementation order in Section 15 of the requirements. Ask me if you need anything clarified. Do not cut scope without asking first.*

---

### What happens next

Claude Code will start building. This will take a while — possibly hours across multiple sessions. It will ask you questions along the way. Your main job is to:

1. Answer questions when it asks them
2. Test features as it completes each phase (it will tell you when something is ready to test)
3. Report back what's not working
4. Provide the schedule, concert program, and other content when ready (see Step 9)

---

## STEP 9: Content You Need to Provide

Before the app can go live with real data, you need to give Claude Code the following. You can provide these at any point — Claude Code will put placeholder text in until you do.

### Weekend Schedule
For each event on the schedule, provide:
- Event name
- Date (April 17, 18, or 19)
- Start time and end time
- Location (venue, room name)
- Event type (choose one: rehearsal, social, concert, meal, logistics)
- Brief description (1-2 sentences, optional)

You can paste this as a simple list in plain English — Claude Code will format it.

### Concert Program (Day-of — Saturday April 18)
You'll enter this directly in the app's admin interface on the day of the concert. No prep needed beforehand — the app shows a placeholder until you add it. You can do this from your phone in a few minutes before the show starts.

### Attendee List
Prepare a spreadsheet or text file with one row per attendee. **Do not include email addresses — the app doesn't need them and you should protect attendee privacy.**

Three columns only:
- Full name (e.g., Jane Smith)
- Graduation year (4-digit year, e.g., 1998)
- Era (must be one of exactly: 60s, 70s, 80s, 90s, 00s, 10s, 20s)

Save it as a CSV file (if using Excel or Google Sheets: File → Download → CSV). You'll upload this through the Admin interface once the app is deployed. The data goes directly into your Firebase database — no AI service ever sees it.

### App Icon / Logo
You'll need the Ephlats logo in these sizes:
- 192 × 192 pixels (PNG)
- 512 × 512 pixels (PNG)
- 180 × 180 pixels (PNG, for iPhone)

If you only have the logo in one format, a designer or tool like Canva can export it at these sizes. Or tell Claude Code what you have and it can try to help.

---

## STEP 10: Make Yourself an Admin

Once the app is deployed and you've created your own account in the app, you need to give yourself admin access. There is only one admin: you.

Claude Code will build a one-time script for this. To run it, you'll type one command in Terminal (from your ephlats-app folder):
```
npm run make-admin your@email.com
```
Replace `your@email.com` with the exact email you used to sign up. Claude Code will provide the exact command when the app is ready. You only ever run this once.

---

## STEP 11: Share the App with Attendees

Once the app is live on Vercel, you'll have a URL like `https://ephlats-2026.vercel.app`. Send this to all attendees before the reunion. The app works on every device and browser — people don't have to install it to use it, but installing gives a nicer experience.

Here's how to explain it to attendees (feel free to copy this text into an email):

---

**Ephlats 2026 App — How to Get It**

Open this link on your phone: **[your URL here]**

The app works in any browser — you can bookmark it and use it right from there. To get it as an icon on your home screen (recommended):

**If you have an iPhone:**
You need to open the link in Safari (not Chrome or another browser).
1. Open Safari and go to the link
2. Tap the Share button (the box with an arrow at the bottom of the screen)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" in the top right
The Ephlats icon will appear on your home screen like a regular app.

**If you have an Android phone:**
1. Open Chrome and go to the link
2. You'll see a banner that says "Add to Home Screen" — tap Install
3. (If you don't see the banner, tap the three dots ⋮ in the top right → "Add to Home Screen")
The Ephlats icon will appear on your home screen.

**If you'd rather not install it:** No problem — just bookmark the link or keep it in your email. Everything works in the browser too.

---

Note: The app itself will also show step-by-step install instructions when people open it in a browser, so even if they miss this email they'll be guided through it.

---

## Troubleshooting

**"I got an error when installing Node.js"**
Try restarting your computer and running the installer again. If it still fails, share the exact error message.

**"Claude Code won't open"**
Make sure you're in the right folder in Terminal (you should see `ephlats-app` at the end of the line before the cursor). Try typing `pwd` and pressing Enter — it should show the path to your ephlats-app folder.

**"Firebase says 'permission denied'"**
This usually means the security rules haven't been set yet. Tell Claude Code you're seeing this error and it will fix the Firestore rules.

**"I can't find the .env.local file I created"**
Files starting with a dot are hidden by default on Mac. In Finder, press `Cmd + Shift + .` to toggle hidden files visible.

**"The app looks broken on my phone"**
Share a screenshot of exactly what you're seeing and tell Claude Code. This is normal — PWA testing on real devices is part of Phase 5 of the build.

---

*Setup guide for Ephlats 2026 App — April 17-19, 2026*
*If anything in this guide is confusing or gives you an error, share the exact error message or screenshot and ask for help.*
