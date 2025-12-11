# 📘 Learning Platform Project Handbook

Welcome to your **Learning Platform**! This handbook is your "Start-to-End" guide for running, understanding, and expanding your project.

---

## 🚀 1. Quick Start (How to Run It)

### Option A: The "Easy" Way (Frontend Only)
If you just want to see the website and click around:

1.  Open a terminal in `apps/frontend`.
2.  Run: `npm start`
3.  Go to: **http://localhost:3000**

*Note: This uses "sample data" if the backend is down, so you can still see courses!*

### Option B: The "Full" Way (Docker)
To run the entire system (Database, API, Frontend) like a pro:

1.  **Start Docker Desktop** (Make sure the whale icon is steady).
2.  Open a terminal in the main project folder.
3.  Run:
    ```bash
    docker-compose up -d
    ```
4.  Wait for a few minutes.
5.  Access everything:
    *   **Frontend**: http://localhost:3000
    *   **Course API**: http://localhost:3001
    *   **User API**: http://localhost:3002
    *   **MailHog (Emails)**: http://localhost:8025

---

## 📂 2. Project Structure (Where is everything?)

*   **`apps/`**: The code for your applications.
    *   `frontend/`: The React website (what you see).
    *   `course-service/`: Node.js API that manages courses.
    *   `user-service/`: Python API that handles users.
    *   `notification-service/`: Go service for sending emails.
*   **`infrastructure/`**: Terraform code to build AWS cloud resources.
*   **`kubernetes/`**: Helm charts to deploy to a cluster.
*   **`docker-compose.yml`**: The file that runs everything locally.

---

## 🛠️ 3. Key Commands Cheat Sheet

| Goal | Command | Where to run |
| :--- | :--- | :--- |
| **Start everything** | `docker-compose up -d` | Root folder |
| **Stop everything** | `docker-compose down` | Root folder |
| **View logs** | `docker-compose logs -f` | Root folder |
| **Rebuild changes** | `docker-compose up -d --build` | Root folder |
| **Start Frontend** | `npm start` | `apps/frontend` |
| **Push to GitHub** | `git push origin main` | Root folder |

---

## 🔧 4. Troubleshooting

### "Docker error: failed to connect..."
*   **Cause**: Docker Desktop is not running.
*   **Fix**: Open Docker Desktop from Start Menu and wait for it to finish starting.

### "Port 3000 is already in use"
*   **Cause**: You have another terminal running the frontend.
*   **Fix**: Close other terminals or run `npx kill-port 3000`.

### "Firebase Error: auth/configuration-not-found"
*   **Cause**: Email/Password auth is disabled in Firebase Console.
*   **Fix**: Go to Firebase Console -> Authentication -> Sign-in method -> Enable Email/Password.

---

## 🌟 5. What's Next? (Your Learning Path)

Now that you have this running, here is your path to mastery:

1.  **Explore the Code**: Look at `apps/frontend/src/components/Home.js` to see how we added the search bar.
2.  **Modify a Course**: Go to `apps/course-service/src/controllers/course.controller.ts` and try changing the sample data.
3.  **Learn Docker**: Try adding a new service to `docker-compose.yml`.
4.  **Deploy to Cloud**: Use the `infrastructure/` folder to deploy this to AWS (Advanced).

---

**Need help?** Check the `README.md` for more technical details!
