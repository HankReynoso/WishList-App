# Wishlist

An owner builds wishlists and invites guests. Guests claim items so nobody buys duplicates. The owner sees only how many guests joined, never who claimed what.

Expo (React Native, expo-router, TypeScript) on Firebase Auth and Firestore. No other backend.

## Setup

1. Install Node 20+ and run `npm install`.
2. In the [Firebase console](https://console.firebase.google.com), create a project and add a Web app.
3. Authentication, Sign-in method: enable **Email/Password** and **Anonymous**.
4. Firestore Database: create a database.
5. Deploy the rules: `npx firebase login`, then `npx firebase deploy --only firestore:rules --project <your-project-id>`.
6. `cp .env.example .env` and fill in the four `EXPO_PUBLIC_FIREBASE_*` values from the Web app config.
7. `npm run ios` or `npm run android`. Invite links use the `wishlist://` scheme, which works in a development build. In Expo Go the shared link uses `exp://` instead.

## How the owner is kept blind

Enforced in `firestore.rules`, not in the app:

- Owners sign in with email and password. Guests are anonymous. The claims rules only admit a joined anonymous guest, so no owner token can read or write `lists/{id}/claims`.
- `guests/{uid}` is readable only by that guest. The owner gets a count from `lists/{id}.guestCount`, which a joining guest may raise by exactly one in the same batch that creates their own guest doc.
- A claim doc id equals the item id and claims are create-only, so a second claim on the same item fails.
- A guest can delete a claim only when its `guestId` is their uid.

Joining as a guest signs out an owner session on that device, since an owner session cannot act as a guest.

## Tests

`npm run test:rules` starts the Firestore emulator (needs Java 21+) and runs `tests/rules.test.ts`.
`npm run typecheck` runs `tsc --noEmit`.
