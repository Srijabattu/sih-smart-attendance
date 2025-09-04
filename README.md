# sih-smart-attendance
Smart Curriculum Activity &amp; Attendance App (SIH 2025 Prototype).
# 🎓 Smart Attendance & Activity Monitoring System  

# 🎓 Smart Attendance & Activity Monitoring System  

## 📌 Problem Statement  
Traditional attendance systems are **time-consuming, error-prone, and lack real-time insights**.  
This project provides a **digital solution** where students can mark attendance via QR codes (and later extendable to face recognition), and teachers/admins can manage records through a dashboard.  

---

## 🎯 Objectives  
- Replace manual attendance with a **secure, digital system**.  
- Provide **real-time monitoring** for teachers and institutions.  
- Enable **automated reporting** for attendance & activities.  
- Ensure **scalability and ease of use** for students and staff.  

---

## 🛠 Tech Stack  
**Frontend**  
- React (Teacher/Admin Dashboard)  
- React Native (Student App with QR Scanner)  

**Backend & Cloud**  
- Firebase Authentication (Login & Roles)  
- Firebase Firestore (Attendance & Records)  
- Firebase Cloud Functions (Validation & Logic)  
- Firebase Hosting (Dashboard Deployment)  

---

## 📂 Project Structure  
```
smart-attendance-app/
│── README.md           # Project documentation
│── dashboard/          # React admin/teacher dashboard
│── student-app/        # React Native student mobile app
│── functions/          # Firebase Cloud Functions
│── seeds/              # Sample Firestore data
│── .gitignore          # Ignore node_modules, env files
```

---

## ⚙️ Features  
✅ Student attendance via **QR code scanning**  
✅ Teacher/Admin dashboard with **real-time records**  
✅ Role-based authentication (**Student / Teacher / Admin**)  
✅ Automated **reports & statistics**  
✅ Secure cloud storage (**Firestore + Blockchain-ready**)  

---

## 🚀 Getting Started  

### 1. Clone Repository  
```bash
git clone https://github.com/<your-username>/smart-attendance-app.git
cd smart-attendance-app
```

### 2. Setup Firebase  
- Create Firebase project  
- Enable **Authentication** (Email/Google Sign-in)  
- Create Firestore database  
- Deploy **Cloud Functions**  

### 3. Run Student App (React Native)  
```bash
cd student-app
npm install
npm start
```

### 4. Run Teacher/Admin Dashboard (React)  
```bash
cd dashboard
npm install
npm run dev
```

---

## 📊 Future Scope  
- Face recognition-based attendance (AI/ML).  
- Offline-first mobile app with auto-sync.  
- Integration with **Learning Management Systems (LMS)**.  
- Advanced analytics on **student engagement**.  

---

## 👨‍💻 Contributors  
- [Battu Srija] – Full Stack Developer
- [Bharath linga reddy] – AI/ML Engineer 
- [Sadiya Tabassum] – Frontend Developer
- [Rani Yadav] – Frontend Developer 
- [Vyshali] –  Designer
- [Jashwitha] - Designer

---

## 📜 License  
This project is licensed under the **MIT License**.  
