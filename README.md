# ACA ORS Web (ISIPPE-3)

React frontend for the Anti-Counterfeit Authority Online Registration Portal, built from the UX Screens 2 designs.

## Stack

- Vite + React + TypeScript
- React Router
- CSS Modules + shared design tokens

## Run locally

```bash
cd ors-web
npm install
npm run dev
```

## Journeys

- Public microsite: `/`, `/about`, `/programme`, `/speakers`, `/sponsorship`, `/venue`, `/faq`
- Registration: `/register` → `/register/details` → `/register/payment` → `/register/confirmation`
- Participant: `/login` → `/dashboard`
- Admin: `/admin/login` → `/admin`, `/admin/events`, `/admin/payments`, `/admin/messages`

Desktop layouts follow the design screens (without the right-side phone mockups). Layouts are mobile-first and adapt using the phone mockups as reference.
