const express = require('express'); //Server engine
const mongoose = require('mongoose');//databse connector
const cors = require('cors');//internet security
const path = require('path');
const bcrypt = require('bcryptjs'); // password protector

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect MongoDB
mongoose.connect('mongodb://localhost:27017/virtual_classroom', {
})
.then(() => console.log('MongoDB connected!'))
.catch(err => console.error('MongoDB connection error:', err));

// Define User model
const UserSchema = new mongoose.Schema({//schema is like a blueprint
    username: String,
    password: String,
    loginTime: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// Save login data (with hashing)
app.post('/api/user/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Received login:', username);

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();

    console.log('User saved to MongoDB with hashed password!');
    res.status(200).json({ message: 'Login saved!' });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ error: 'Failed to save login' });
  }
});

// Get all login data
app.get('/api/user/logins', async (req, res) => {
  try {
    const users = await User.find().sort({ loginTime: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching logins:', error);
    res.status(500).json({ error: 'Failed to fetch logins' });
  }
});
// Define Feedback model
const FeedbackSchema = new mongoose.Schema({//this stores user feedback
  name: String,
  email: String,
  message: String,
  submittedAt: { type: Date, default: Date.now }
});

const Feedback = mongoose.model('Feedback', FeedbackSchema);

// Route to save feedback
app.post('/api/feedback', async (req, res) => {
  const { name, email, message } = req.body;
  try {
    const feedback = new Feedback({ name, email, message });
    await feedback.save();
    res.status(200).json({ message: 'Feedback submitted!' });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Route to get all feedback
app.get('/api/feedback', async (req, res) => {
  try {
    const feedbackList = await Feedback.find().sort({ submittedAt: -1 });
    res.json(feedbackList);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Server start
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
/*
How it all connects
UserLogin.html     ---> POST /api/user/login    ---> MongoDB (save login)
Feedback.html      ---> POST /api/feedback      ---> MongoDB (save feedback)

AdminDashboard.html
  |--> GET /api/feedback   ---> MongoDB (show feedback)
  |--> GET /api/user/logins---> MongoDB (show logins)
  Everything is real-time and connected through MongoDB, Node.js, and the web pages.
Q: What is the tech stack used?
A: Node.js + Express for backend, MongoDB for database, HTML/CSS/JS + Tailwind for frontend.

Q: What happens when a user logs in?
A: Their username (email) and login time are stored securely with a hashed password in MongoDB.

Q: Where is the feedback stored?
A: In the MongoDB feedbacks collection, with fields for name, email, message, and timestamp.

Q: Can multiple users log in at the same time?
A: Yes. The system supports concurrency and handles multiple users smoothly using asynchronous operations.

Q: What does the admin dashboard do?
A: It fetches and displays login logs and recent feedback in real-time using JavaScript fetch API.

**📄 3D Virtual Campus Tour - Viva Cheat Sheet**

---

### 🔧 Project Summary:

* **Title**: 3D Virtual Campus Tour
* **Type**: Real-Time Web App
* **Purpose**: Show KMIT campus virtually + collect feedback + track user logins
* **Users**: Students, Visitors, Admins

### 🧰 Tech Stack:

* **Frontend**: HTML5, CSS3, JavaScript, Tailwind CSS
* **Backend**: Node.js + Express
* **Database**: MongoDB (local/Atlas)
* **Hosting**: Render (backend), MongoDB Atlas (DB)

### 🧠 Core Features:

1. **Login Tracker**:

   * Logs each user login (email = username)
   * Uses bcrypt to hash passwords
   * Stored in MongoDB with timestamp

2. **Feedback System**:

   * Name, Email, Message fields
   * Sent to backend and saved to MongoDB
   * Admin views all feedback

3. **Admin Dashboard**:

   * View user logins & feedback in real time
   * Stylish UI with side navigation and info cards

### 📦 MongoDB Collections:

* `users` ➜ username, password, loginTime
* `feedbacks` ➜ name, email, message, submittedAt

### 📡 API Endpoints:

| Method | URL                | Function              |
| ------ | ------------------ | --------------------- |
| POST   | `/api/user/login`  | Save login info       |
| GET    | `/api/user/logins` | Get all login entries |
| POST   | `/api/feedback`    | Save feedback         |
| GET    | `/api/feedback`    | Get all feedbacks     |

### 🔒 Security:

* Passwords hashed using bcrypt
* CORS enabled
* JSON-based communication

### 💬 Common Viva Questions:

1. **Q:** Why MongoDB?
   **A:** It stores JSON-like data easily, perfect for flexible forms and fast queries.

2. **Q:** What is Express used for?
   **A:** To handle API routing and server logic.

3. **Q:** What is Tailwind CSS?
   **A:** A utility-first CSS framework to style HTML with ready-made classes.

4. **Q:** How is feedback displayed to admin?
   **A:** Fetched from `/api/feedback` and shown using JS DOM in AdminDashboard.html.

5. **Q:** Where is the 3D part?
   **A:** It can be added using Sketchfab iframe or custom 3D scenes on the tour page.

---

**📊 System Architecture Diagram**

```
+------------------+      +-------------------+
|   User Login     | ---> |  Express API      |
|  (Frontend)      |      |  /api/user/login  |
+------------------+      +-------------------+
                                      |
                                      v
                          +------------------------+
                          |    MongoDB (users)     |
                          +------------------------+

+-------------------+     +-------------------+
|  Feedback Form    | --> |  Express API      |
|  (Frontend)       |     |  /api/feedback    |
+-------------------+     +-------------------+
                                      |
                                      v
                          +------------------------+
                          | MongoDB (feedbacks)     |
                          +------------------------+

+---------------------------+
|    Admin Dashboard        |
|    (View Feedback + Logs) |
+---------------------------+
```

---

**✅ Review Checklist (Night Before Review):**

* [x] `server.js` running with no errors ✅
* [x] `UserLogin.html` connects and redirects ✅
* [x] `Feedback.html` submits successfully ✅
* [x] `AdminDashboard.html` shows feedback & logins ✅
* [x] Practice 5 sample viva questions ✅
* [x] PPT and Documentation ready ✅
* [x] Project files backed up ✅
* [x] Internet connection tested ✅

---

You've got this! Best of luck 💪

can u explain in detail about the architecture diagram u provided


ChatGPT said:
Absolutely! Let's break down the Architecture Diagram step by step so even a beginner can understand how all parts of your 3D Virtual Campus Tour project work together like a smart team.

🏗️ What is an Architecture Diagram?
It’s like a map or blueprint showing:

Who uses your app

What tools are used

How data flows from one place to another

Now let’s look at the one I gave you:

🔍 Full Breakdown of the Architecture Diagram
pgsql
Copy code
+------------------+      +-------------------+
|   User Login     | ---> |  Express API      |
|  (Frontend)      |      |  /api/user/login  |
+------------------+      +-------------------+
                                      |
                                      v
                          +------------------------+
                          |    MongoDB (users)     |
                          +------------------------+

+-------------------+     +-------------------+
|  Feedback Form    | --> |  Express API      |
|  (Frontend)       |     |  /api/feedback    |
+-------------------+     +-------------------+
                                      |
                                      v
                          +------------------------+
                          | MongoDB (feedbacks)     |
                          +------------------------+

+---------------------------+
|    Admin Dashboard        |
|    (View Feedback + Logs) |
+---------------------------+
🧍 Part 1: The User
This is a real person—like a student, visitor, or faculty member—who opens the app.

They interact with:
UserLogin.html – to log in

Feedback.html – to give suggestions

Think of the user as someone typing and clicking on buttons in the browser.

🧑‍💻 Part 2: The Frontend
This includes your HTML files (UserLogin.html, Feedback.html, etc.) built using:

Tailwind CSS – for beautiful styling

JavaScript – to collect and send data

These web pages collect input (username, password, feedback) and then send it to the backend.

🔄 Part 3: Express API (Backend Logic)
This is written in server.js using:

Express.js (a web server)

Node.js (JavaScript on the server)

bcrypt for password security

MongoDB driver for database work

What it does:

Receives form data

Processes it

Saves it in the right MongoDB collection

Sends responses back to the frontend

🔗 API Endpoints:

Endpoint	Purpose
/api/user/login	Save login info
/api/feedback	Save user feedback
/api/user/logins	Get all login history
/api/feedback	Get all feedback entries

🗄️ Part 4: MongoDB (Database)
MongoDB is your data storage system, like a giant digital notebook.

It has 2 collections (like tables):

users: Stores who logged in and when

feedbacks: Stores feedback messages from users

Data is stored in real-time using Mongoose models.

📥 Example users document:

json
Copy code
{
  "username": "abc@gmail.com",
  "password": "encrypted_text",
  "loginTime": "2025-05-30T17:45:00Z"
}
📥 Example feedback document:

json
Copy code
{
  "name": "Aruna",
  "email": "abc@example.com",
  "message": "Loved the 3D tour!",
  "submittedAt": "2025-05-30T17:47:00Z"
}
📊 Part 5: Admin Dashboard
This is a special HTML page:

Used by admins

Displays user feedback and login logs

Uses fetch() to get data from the server in real-time

🟢 It helps the admin answer questions like:

Who logged in recently?

What feedback have users submitted?

Are there any issues raised?

✅ In Summary:
The Whole Flow Looks Like This:
A user opens the login or feedback page

Enters their email/password or feedback

That info is sent to the Express server

Express saves it into MongoDB

Admin opens the dashboard

Admin sees real-time updates of login logs & feedback

All done via clean APIs and live JavaScript fetch calls

📚 Tips to Explain to Viva Panel:
“Frontend collects data and communicates with the backend using fetch.”

“Backend is built on Express; it handles routes like /api/user/login.”

“Data is stored in MongoDB Atlas/local using Mongoose models.”

“The admin dashboard pulls data in real-time and shows it without reloading.”

Would you like a visually designed version of this architecture diagram for printing or showing on a slide? I can generate one for you.


2/2





*/
