# 🎓 TaskRise – Faculty Task Management Portal

Welcome to **TaskRise**, a modern, full-featured web application designed to streamline task allocation, progress tracking, and approval workflows for faculty and HoD in educational institutions.

---

## 🚀 Features

- **Role-based Login:** Secure login for HoD and Faculty using email or username.
- **Dynamic Dashboard:** Personalized dashboard with a warm welcome and real-time stats.
- **Task Allocation:** HoD can allocate tasks to one or multiple faculty members with due dates and categories.
- **Task Portal:** Faculty can view allocated, in-progress, and completed tasks in a Kanban-style interface.
- **Task Submission & Approval:** Faculty submit completed tasks for HoD approval; HoD can review and approve with a single click.
- **Profile Pages:** Beautiful, detailed profile pages for both HoD and individual staff.
- **Analytics:** Visualize activity with attractive Bar and Area charts (powered by Recharts).
- **To-Do List:** Faculty can manage personal to-dos with due dates and status highlights.
- **Responsive UI:** Clean, modern, and mobile-friendly design using Tailwind CSS.
- **Persistent State:** All task actions are saved in localStorage for a seamless experience.

---


## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS
- **Charts:** Recharts, Chart.js (for legacy)
- **State:** React Hooks, localStorage
- **Routing:** React Router
- **Notifications:** react-toastify

---

## 📦 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/taskrise.git
   cd taskrise
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the app:**
   ```bash
   npm start
   ```

4. **Open in browser:**
   ```
   http://localhost:3000
   ```

---

## 👤 User Roles

- **HoD:** Can allocate tasks, view all staff, approve submissions, and see analytics.
- **Faculty:** Can view allocated tasks, submit work, manage personal to-dos, and view their profile.

---

## 📁 Project Structure

```
src/
  ├── assets/           # Images, videos, and static assets
  ├── components/       # Reusable UI components (Header, AddTask, ShowTask, etc.)
  ├── Data/             # JSON data for staff and HoD
  ├── pages/            # Main pages (Dashboard, TaskPortal, TaskApproval, Profile, etc.)
  ├── App.jsx
  └── main.jsx
```

---

## ✨ Credits

- UI inspired by modern dashboard designs.
- Icons by [react-icons](https://react-icons.github.io/react-icons/).
- Charts by [Recharts](https://recharts.org/) and [Chart.js](https://www.chartjs.org/).

---

## 📣 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

This project is licensed under the MIT License.

---

> **TaskRise** – Empowering faculty, simplifying workflows.
