## Trump Tracker (Class Project)

This is a test project for a class assignment.
It is a simple static website that shows:

Economy indicators (CPI, GDP, Unemployment)

Approval ratings (from a CSV converted to JSON)

Presidential promises (from PolitiFact’s MAGA-Meter, saved as a JSON snapshot)

Everything runs in the browser using HTML, CSS, and JavaScript.

A Cloudflare Worker is used to proxy FRED API requests so the site can load economic data without CORS issues.

Setup

Clone the repo:

``git clone https://github.com/JacobThree/Trump-tracker.git
cd Trump-tracker``


Copy the sample config:

``cp assets/js/config.sample.js assets/js/config.js``


Add your own FRED API key to config.js.

Start any local server, for example:

``python3 -m http.server 8080``


Then open:

http://localhost:8080

Data Sources

Economy (via FRED)

CPI: https://fred.stlouisfed.org/series/CPIAUCSL

GDP: https://fred.stlouisfed.org/series/A191RL1Q225SBEA

Unemployment Rate: https://fred.stlouisfed.org/series/UNRATE

Approval Ratings

From a CSV file (Nate Silver’s approval trend), converted to JSON.

Promises

Snapshot of MAGA-Meter: Trump’s Second Term
https://www.politifact.com/truth-o-meter/promises/maga-meter-tracking-donald-trumps-2024-promises/

Notes

config.js (contains API key) is ignored and must not be committed.

JSON data files are static snapshots used only for this project.

This project is not official and is made purely for educational purposes.
