# Dreams and Disasters

Dreams and Disasters is a classroom activity for careers and life-planning
classes. Students explore how career and education choices, income, expenses,
and unexpected life events can affect their plans over time.

The app helps a teacher run the activity: it assigns events to players, rolls
one six-sided die for each event, and keeps a history of rounds. Students use
the event descriptions and class rules to decide what happens next and record
the effects on their own plans. The app does not calculate budgets or make
career decisions for students.

## Run the Activity

1. Start a local web server in the project folder. For example, with Python
	installed, run `py -m http.server 8000` in a terminal.
2. Open `http://localhost:8000` in a web browser.
3. Open **Settings** and review the players, rules, events, and events-per-round
	setting. Adjust them for your class before starting.
4. Use the **Player Sheet** link to open the planning sheet. Students can use it
	to track goals, income, savings, and expenses during the activity.
5. On the Home page, select **Play** to create a round. For each assigned
	event, click the dice button to roll one die or enter a result from 1 to 6.
	Read the event and apply the class rules, then update the player sheet.
6. Use the round navigation to review earlier results. Export history to keep a
	copy or import a previous history file.

## Classroom Setup

- Review the sample rules and event descriptions in Settings; edit, add, or
  remove entries to fit your lesson.
- Set the number of events per round based on class size and available time.
- Agree on how students will apply event outcomes before play begins. The
  sample rules are prompts to customize, not required financial guidance.
- The app stores settings and history in the current browser on the current
  device. Use the export buttons to keep files or transfer data between devices.

## Project Notes

This is a small static web app made with HTML, CSS, and JavaScript. It has no
build step or server-side account system. Serve the project over HTTP so the
browser can load the default settings file. Font Awesome icons are loaded from
a CDN, so an internet connection is needed for those icons to appear.
