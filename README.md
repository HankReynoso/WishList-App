# Gift-Wrapped

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

## Deleting items and lists

The owner can edit and delete items, and edit or delete a list. The owner cannot read or delete `claims` or `guests`, so deletes leave data behind by design:

- Deleting an item leaves its claim doc. It is invisible to the owner. Guests can still read it (and release it), but the guest screen only renders claims for items that exist, so it does nothing. Item ids are auto-generated, so the orphan never attaches to a new item.
- Deleting a list deletes its items, then its `codes/{code}` doc and the list doc together. Its `claims` and `guests` docs stay in Firestore but nobody can read them: every claims and guests rule resolves the list doc first, and it no longer exists. Clearing them would need an admin tool or a Cloud Function.

## Accounts and guests

- Owners can delete their account in Settings (reached from the lists screen). It re-asks for the password, deletes every owned list with `deleteList`, then deletes the Auth user. If the last step fails the lists are already gone and the screen says so. Retrying finishes it.
- Owners can reset a forgotten password from the sign-in screen. The message is the same whether or not the email has an account.
- Guests keep a local list of joined lists in AsyncStorage (`My joined lists`). Leave and Remove only clear the local entry. The guest doc and claims stay in Firestore.

Joining as a guest signs out an owner session on that device, since an owner session cannot act as a guest.

## Release

`scripts/make-icons.mjs` regenerates the icon, adaptive icon and splash PNGs in `assets/`. The static support and privacy pages are in `docs/` for GitHub Pages. `RELEASE.md` lists the manual store steps.

## Tests

`npm run test:rules` starts the Firestore emulator (needs Java 21+) and runs `tests/rules.test.ts`.
`npm run typecheck` runs `tsc --noEmit`.

## Languages

The app follows the phone language: Spanish for any `es` locale, English otherwise. Strings live in `src/i18n.ts`, where `en` is the source of truth and `es` must have the same keys, or the typecheck fails. The native app name per language is in `locales/`. The support and privacy pages have Spanish copies in `docs/es/`.
