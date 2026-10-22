# DAY1 · IB Computer Science

A Duolingo-style study site for **IB Diploma Computer Science** (first assessment 2027). Practise a little every day and keep your streak alive.

## Features

- **Daily challenge**: 7 multiple-choice questions. Everyone gets the same set each day, and it can be played once per day.
- **Practice modes**: Quick (10), Standard (20) and Marathon (50) questions drawn from across the syllabus.
- **Custom mode**: switch topics on or off (A1.1 … B2.4) and choose how many questions to play.
- **Topic drills**: tap any topic on the home screen for a 10-question drill.
- **Five question types**: multiple choice, true/false, fill in the blank, match the pairs and put in order.
- **Feedback on every answer**: you see the right answer and a short explanation.
- **Streaks**: completing any lesson keeps your 🔥 streak alive. You also earn XP and see accuracy per topic.
- **Mistakes review**: at the end of a lesson you can re-play the questions you got wrong.
- **Settings**: light/dark/system theme, name, profile picture (preset avatar, uploaded photo or Google photo), SL/HL level and sound.
- **Google sign-in** (Firebase): progress syncs across devices. Guest mode keeps progress in the browser.

## Question bank

586 questions across 15 topics, organised to match the course slides:

| Unit | Topics |
| --- | --- |
| A1 Computer Fundamentals | A1.1 Hardware · A1.2 Data Representation · A1.3 Operating Systems · A1.4 Translation |
| A2 Networks | A2.1 Fundamentals · A2.2 Architecture · A2.3 Data Transmission |
| A3 Databases | A3.1 Fundamentals · A3.2 Design · A3.3 Programming · A3.4 Alternative Databases (HL) |
| B1 Computational Thinking | B1.1 Approaches to Computational Thinking |
| B2 Programming | B2.1 Fundamentals · B2.2 Data Structures · B2.4 Algorithms |

Questions live in `js/questions/*.js`. Add more with the helpers documented at the top of `js/bank.js`.

## Run locally

It is a static site, so no build step is needed.

```bash
python -m http.server 5500
```

Then open http://localhost:5500.

## Enable Google sign-in (Firebase)

1. Create a project at https://console.firebase.google.com (Analytics is optional).
2. **Build → Authentication → Get started → Sign-in method → Google → Enable.**
3. **Build → Firestore Database → Create database** (production mode). Then open the **Rules** tab and paste the contents of `firestore.rules`.
4. **Project settings → General → Your apps → Web (`</>`)**: register an app and copy the `firebaseConfig` values into `js/config.js`.
5. **Authentication → Settings → Authorized domains**: add your GitHub Pages domain, e.g. `your-username.github.io`.

The Firebase web config is not secret. Access is protected by the Firestore rules, so each user can only read and write their own document.
