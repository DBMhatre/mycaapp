# MycaApp

MycaApp is a production-ready React Native application that delivers a guided mental-wellbeing experience. Users onboard with OTP authentication, explore curated courses, complete assessments, log their mood, and interact with the MYCA assistant while staying engaged through reminders and push notifications. The app ships for both iOS and Android from a single, strongly-typed codebase.

## Table of Contents

1. [Overview](#overview)
2. [Feature Highlights](#feature-highlights)
3. [Tech Stack](#tech-stack)
4. [Architecture at a Glance](#architecture-at-a-glance)
5. [Project Structure](#project-structure)
6. [Getting Started](#getting-started)
7. [Quality & Tooling](#quality--tooling)
8. [Build & Release](#build--release)
9. [Analytics & Observability](#analytics--observability)
10. [Troubleshooting](#troubleshooting)
11. [Contributing](#contributing)
12. [License](#license)

## Overview

- **Platforms:** Android and iOS (React Native 0.78 + React 19)
- **Language:** TypeScript-first implementation with strict typing across modules
- **Navigation:** Drawer + stack navigation driven by `AppNavigator.tsx`
- **State & Data:** Redux Toolkit store paired with React Query and MMKV for persistent session management
- **APIs:** REST integration via a shared Axios client targeting the MYCA backend (`https://myca.vopa.in/`)
- **Audience:** Learners, counselors, and wellbeing facilitators seeking structured self-care programs

## Feature Highlights

- OTP-based login, organization-aware onboarding, and role selection
- Multi-language UI (currently English and Marathi) backed by the translations context
- Modular learning journeys: courses → chapters → parts with progress tracking
- Daily activities, guided meditations, breathing companions, and themed puzzles
- Self-assessment flows with scoring and historical diary entries
- Push notifications, in-app reminders, and local scheduling helpers
- Rich media support for video, audio, charts, PDFs, and HTML-rendered content
- Chat with MYCA assistant, FAQ center, helpline access, and About Us resources
- In-app analytics powered by Firebase Analytics and PostHog, plus crash/error visibility via Sentry

## Tech Stack

- **Core:** React Native 0.78, React 19, TypeScript 5
- **Navigation:** `@react-navigation/native`, stack and drawer navigators
- **State:** Redux Toolkit, React Redux, React Query
- **Storage:** `react-native-mmkv`, AsyncStorage for cross-platform persistence
- **Networking:** Axios with request interceptors and token injection
- **UI Kit & UX:** RNE UI components, Lottie animations, `react-native-vector-icons`, SVG assets
- **Engagement:** Firebase Analytics, PostHog, Sentry, local notifications
- **Testing:** Jest + React Native Testing Library (see `__tests__`)
- **Tooling:** ESLint, Prettier, Metro bundler, TypeScript project references

## Architecture at a Glance

- **Navigation shell:** `AppNavigator.tsx` bootstraps authentication-aware navigation, wraps analytics, and mounts the drawer scaffold (`DrawerNavigator.tsx`).
- **State management:** Redux lives under `src/redux/`, with `RootState` providing typed selectors and actions (e.g., `setIsAuthenticated`). Long-lived values (token, user profile) use MMKV for resilient persistence.
- **Networking:** `src/common/axiosClient/axiosClient.ts` defines the REST client, injecting the auth token at call-time. Domain APIs sit in `src/common/apis/api.ts`.
- **Feature modules:** Each feature (courses, daily activity, breathing exercises, diary, chat, etc.) is encapsulated within its own folder under `src/components/`.
- **Shared utilities:** The `src/common` directory hosts constants, styled components, keyboard utilities, and reusable helper functions.
- **Notifications:** `PushNotificationService.ts` configures channels and serves local notification triggers.
- **Configuration:** Environment values (e.g., `CHAT_API_KEY`) are injected via `react-native-dotenv` (`env.d.ts` declares types).

## Project Structure

```text
.
├── AppNavigator.tsx
├── DrawerNavigator.tsx
├── PushNotificationService.ts
├── src
│   ├── common
│   │   ├── apis/
│   │   ├── axiosClient/
│   │   ├── constants/
│   │   ├── functionUtils/
│   │   └── StyledComponents/
│   ├── components
│   │   ├── Dashboard/
│   │   ├── Login/
│   │   ├── Courses/
│   │   ├── DailyActivity/
│   │   ├── GuidedMeditation/
│   │   ├── MoodCalender/
│   │   ├── PersonalDiary/
│   │   ├── Puzzle/
│   │   ├── SelfAssessment/
│   │   └── ...
│   └── redux/
└── __tests__/        # Jest unit and component tests
```

> Tip: Use this as a guide when adding new feature folders—keep domain logic inside `src/components/<Feature>` and shared utilities in `src/common`.

## Getting Started

### Prerequisites

- Node.js **18+** (align with the `engines` field in `package.json`)
- Yarn 1.x (preferred) or npm 9+
- Watchman (macOS) for fast file system watchers
- Xcode 15+, CocoaPods, and Ruby Bundler for iOS builds
- Android Studio (Electric Eel or newer) with SDK 34, NDK, and an emulator/device
- Java 17 (Gradle requirement for React Native 0.78)

### Installation

```sh
git clone <repo-url>
cd mycaapp
yarn install
# or
npm install
```

Install native dependencies for iOS:

```sh
yarn pod-install   # wraps `cd ios && bundle exec pod install`
```

### Environment variables

Create a `.env` file at the project root (referenced by `react-native-dotenv`):

```text
CHAT_API_KEY=your-posthog-chat-api-key
POSTHOG_API_KEY=your-posthog-project-key
POSTHOG_HOST=https://us.i.posthog.com
SENTRY_DSN=your-sentry-dsn
```

- `CHAT_API_KEY` is consumed in `src/common/apis/api.ts` for chat services.
- The PostHog keys are currently hard-coded in `AppNavigator.tsx`; moving them into env vars is recommended for production secrets management.
- Update the base URL in `src/common/axiosClient/axiosClient.ts` if you deploy against non-production environments.

### Run the app

Start Metro in one terminal:

```sh
yarn start
```

Launch Android:

```sh
yarn android
```

Launch iOS (after installing pods):

```sh
yarn ios
```

> If you prefer npm, replace `yarn <command>` with the matching `npm run <command>`.

## Quality & Tooling

- **Type checking:** TypeScript runs automatically through Metro, but you can add `tsc --noEmit` pre-commit checks.
- **Linting:** `yarn lint` (ESLint with React Native config)
- **Formatting:** Prettier 2.8 is bundled; integrate with your editor or run manually.
- **Testing:** `yarn test` executes Jest suites under `__tests__/`. Add tests for new reducers, hooks, and presentation components.

Consider adding pre-commit hooks (Husky + lint-staged) to automate linting and testing before merging.

## Build & Release

### Android

```sh
cd android
./gradlew assembleRelease           # builds app-release.apk
./gradlew bundleRelease             # builds app.aab for Play Store
```

- Configure signing configs in `android/app/build.gradle`.
- Use `./gradlew clean` if you run into stale caches between builds.

### iOS

```sh
cd ios
bundle exec pod install
xcodebuild -workspace MycaApp.xcworkspace \
  -scheme MycaApp \
  -configuration Release \
  -sdk iphoneos \
  -archivePath ./build/MycaApp.xcarchive archive
```

- Manage signing identities and provisioning profiles through Xcode.
- Use `xcodebuild -exportArchive` to produce an `.ipa` for TestFlight/App Store.

## Analytics & Observability

- **Firebase Analytics:** Automatic screen tracking via `analytics().logScreenView` in `AppNavigator.tsx`.
- **PostHog:** Session tracking and user identification using `PostHogProvider`. Ensure production keys and EU/US data residency are configured correctly.
- **Sentry:** Integrated for error reporting (`@sentry/react-native`). Run `npx @sentry/wizard -i reactNative` to re-link if upgrading native dependencies.
- **Push notifications:** Local scheduling is handled through `PushNotificationService.ts`; make sure FCM/APNs credentials are configured per platform.

Instrument any new flows by expanding analytics events in `AppNavigator.tsx` or feature-specific modules.

## Troubleshooting

- Metro cache issues: `yarn start --reset-cache`
- Android build failures: `cd android && ./gradlew clean`
- iOS pod mismatches: `cd ios && rm -rf Pods Podfile.lock && bundle exec pod install`
- Emulator not connecting to backend: verify device network reaches `https://myca.vopa.in/` or update the axios base URL for local debugging.
- MMKV permission issues on Android: ensure `MainApplication` initializes MMKV and reinstall the app after updating storage configs.

## Contributing

1. Create a feature branch off `main` using a descriptive name (`feature/add-reminder-snooze`).
2. Keep commits focused and reference Jira/Ticket IDs where applicable.
3. Add or update tests alongside functional changes.
4. Run `yarn lint` and `yarn test` before raising a Pull Request.
5. Request review from at least one teammate; highlight analytics or backend contract changes explicitly.

## License

This repository is private and all rights are reserved to the MYCA team. Contact the project maintainers for usage or distribution inquiries.
