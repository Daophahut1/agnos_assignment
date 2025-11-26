# Development Planning Documentation

## 1. Project Structure

The project is organized using the Next.js App Router architecture, ensuring a clear separation of concerns between routing, UI components, and backend logic.

```
src/
├── app/                    # App Router (Routes & Layouts)
│   ├── layout.tsx          # Root layout with global providers
│   ├── page.tsx            # Landing page
│   ├── patient/            # Patient Form Route
│   │   └── page.tsx
│   └── staff/              # Staff Dashboard Route
│       └── page.tsx
├── components/             # Reusable UI Components
│   ├── PatientForm.tsx     # Complex form logic, validation, and UI
│   └── StaffDashboard.tsx  # Real-time monitoring dashboard
├── lib/                    # Utilities
│   └── socket.ts           # Socket.io client singleton
└── pages/                  # Pages Router (for Custom Server)
    └── api/
        └── socket.ts       # Socket.io server implementation
```

## 2. Design Decisions (UI/UX)

*   **Glassmorphism Aesthetic:** Chosen to convey a modern, clean, and high-tech feel suitable for a forward-thinking healthcare application. The use of semi-transparent backgrounds and blurs helps content stand out while maintaining a sense of depth.
*   **Mobile-First Approach:** The `PatientForm` is designed as a single column on mobile devices for ease of use, expanding to a multi-column grid on larger screens to utilize available space efficiently.
*   **Visual Feedback:**
    *   **Real-time Indicators:** Pulse animations in the Staff View show when data is being received.
    *   **Validation:** Immediate visual cues (red borders, error messages) guide the user to correct mistakes without frustration.
    *   **Progress Tracking:** A dynamic step indicator in the Patient Form helps users understand their progress through the intake process.

## 3. Component Architecture

*   **`PatientForm.tsx`**:
    *   **State Management:** Uses `useState` for form data and validation errors.
    *   **Logic:** Contains `validate()` function for data integrity and `useMemo` for calculating the current form step.
    *   **Communication:** Emits `input-change` events on every keystroke and `form-submit` on completion.
    *   **Sub-components:** Includes internal components like `AddressAutocomplete` (using OpenStreetMap) and `CustomDatePicker` for modularity.

*   **`StaffDashboard.tsx`**:
    *   **State Management:** Tracks `currentPatient` (live data), `submissions` (history), and connection status.
    *   **Real-time Listeners:** Sets up Socket.io listeners for `update-dashboard` and `new-submission` events.
    *   **Inactivity Logic:** Implements a timer to detect when the patient stops typing, updating the status to "Idle".

## 4. Real-Time Synchronization Flow

1.  **Connection:** Both the Patient Client and Staff Client connect to the Socket.io server hosted at `/api/socket`.
2.  **Input Event:**
    *   When a patient types in `PatientForm`, an `input-change` event is emitted with the entire form data object.
3.  **Server Relay:**
    *   The Socket.io server receives `input-change`.
    *   It immediately broadcasts an `update-dashboard` event to all connected clients (specifically targeting the Staff Dashboard).
4.  **Dashboard Update:**
    *   `StaffDashboard` receives `update-dashboard`.
    *   It updates its local state, triggering a re-render to display the new data instantly.
    *   It sets an "Active Input" status indicator.
5.  **Submission:**
    *   When the form is submitted, a `form-submit` event is sent.
    *   The server broadcasts `new-submission`.
    *   The dashboard moves the current patient data to the "Recent Submissions" list and clears the live view.
