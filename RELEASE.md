# Releasing Gift-Wrapped

Everything below needs your accounts and cannot be done from the repo. `eas.json` and `app.json` are already set up. Bundle id and package are `com.hankreynoso.giftwrapped`, version `1.0.0`.

## Before the first build

1. Create an Expo account at expo.dev.
2. Run `npx eas-cli login`.
3. Run `npx eas-cli build:configure`. It links the project (writes `extra.eas.projectId` into `app.json`). Commit that change.
4. Create `.env` from `.env.example`. For cloud builds, add the four `EXPO_PUBLIC_FIREBASE_*` values as EAS environment variables (`npx eas-cli env:create`) because `.env` is not uploaded.
5. Deploy the Firestore rules yourself: `npx firebase deploy --only firestore:rules --project wishlist-app-ca27d`.
6. Enable Email/Password and Anonymous sign-in in the Firebase console.
7. Publish `docs/` on GitHub Pages (repo Settings, Pages, deploy from branch, `/docs` folder). The support email is already set in both pages. The privacy URL is `https://<user>.github.io/<repo>/privacy.html` and the support URL is the same without the file name.

## iOS

1. Enroll in the Apple Developer Program.
2. Create the app in App Store Connect with bundle id `com.hankreynoso.giftwrapped` and name Gift-Wrapped.
3. `npx eas-cli build --platform ios --profile production` and let EAS create the distribution certificate and provisioning profile when it asks.
4. `npx eas-cli submit --platform ios` or upload through Transporter.
5. Fill the store listing: name, subtitle, description, keywords, category (Lifestyle is a fit), support URL, privacy policy URL, age rating questionnaire, copyright.
6. Screenshots: 6.9 inch iPhone (1320x2868) is required. 6.5 inch (1284x2778) is accepted as a fallback. iPad screenshots only if iPad is supported. `app.json` does not set `supportsTablet`, so it is off.
7. App Privacy answers (match what the app does):
   - Contact info, email address: collected, linked to the user, used for app functionality (owner sign-in). Not used for tracking.
   - User content, other user content (lists, items, guest display names, claims): collected, linked to the user, app functionality. Not used for tracking.
   - Identifiers, user ID (Firebase uid, anonymous for guests): collected, linked to the user, app functionality. Not used for tracking.
   - Tracking: No. No third-party advertising, no analytics.
8. Export compliance is already answered in the build (`ITSAppUsesNonExemptEncryption: false`).
9. Account deletion: tell reviewers it is under Lists, Settings, Delete account.

## Android

1. Create a Google Play developer account.
2. Create the app in Play Console with package `com.hankreynoso.giftwrapped`.
3. `npx eas-cli build --platform android --profile production` produces an AAB. Google requires the first upload to be done by hand in Play Console. After that, `npx eas-cli submit --platform android` works with a Play service account key.
4. Opt in to Play App Signing when prompted.
5. Store listing: short description (80 chars), full description, 512x512 icon, 1024x500 feature graphic, at least 2 phone screenshots (16:9 or 9:16, 320 to 3840 px per side).
6. Content rating questionnaire and target audience.
7. Data safety answers (match what the app does):
   - Data collected: Email address (account management), User IDs (app functionality), Other user-generated content (lists, items, names, claims).
   - Data shared with third parties: No. Firebase acts as a service provider.
   - Data encrypted in transit: Yes.
   - Users can request deletion: Yes. In-app (Settings, Delete account) for owners, and a web link is required: use the support page URL. Guests can ask by email.
   - No ads, no analytics, no data sold.
8. Privacy policy URL: the `privacy.html` page.
9. New personal Play accounts must run a closed test with testers for a minimum period before production. Check the current Play requirements.

## Review accounts

Reviewers cannot guess a login, so prepare these before submitting and put them in App Review Information (iOS) and App access (Play):

1. Create a test owner account in the app (an email you control and a password).
2. Sign in as that owner, create a sample list, add two or three items with links.
3. Write down the list's invite code (shown on the list screen).
4. Give the reviewer the owner email, password and the invite code. Tell them guests join with "Join with a code" and need no account.
5. Do not delete this list while review is in progress.

## Known limits to mention if asked

- Deleting a list or account leaves unreachable guest and claim records in Firestore. Clearing them needs an admin tool or a Cloud Function.
- Guests have no in-app account deletion. "Leave" only clears the list from the device.

## Verified only on the repo, not on a device

Nothing here has been run on an iOS or Android device or simulator. Test sign-up, password reset, join, claim, account deletion, and the icon and splash on real devices or a preview build before submitting.
