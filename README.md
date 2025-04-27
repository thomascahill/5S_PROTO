# CPQRS Local Application

## Setup Instructions

1. Download and extract this folder to your computer
2. Open Chrome browser
3. Go to chrome://flags/#allow-file-access-from-files
4. Enable "Allow File Access From Files"
5. Restart Chrome
6. Open the `index.html` file in Chrome

## Alternative Setup (Using Live Server)

If you have Visual Studio Code:

1. Install the "Live Server" extension
2. Right-click `index.html` and select "Open with Live Server"
3. The app will open in your default browser

## Notes

- To spin up a local server use the python command:
- python3 -m http.server 8000
- All data is stored in your browser's local storage
- Each letter (C,P,Q,R,S) maintains separate states for each month
- Colors indicate: Green (Achieved), Blue (Unscheduled), Red (Missed)
