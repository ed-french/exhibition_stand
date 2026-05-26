# Apitronix Exhibition Stand

## Overview
I am looking to build a python project to run on a laptop on an exhibition stand.
The objective is to give visitors the chance to sign up for a free development board when they become available.
It should run in two states:
1. Advertising mode
1. Collecting registration mode



# Advertising mode
A simple 2D animation advertises the dev kit offer and encourages users to press a keyboard key to enter their details.
From a distance it should be attractive and simple to understand. Minimum information. Constantly in smooth motion.
When any key is pressed the laptop will enter "Collecting Mode".
A configurable secret key combination e.g. % will exit the application.

# Collecting mode
This will have a brief summary of the offer, and then collect names, email addresses and usage type information.
On submitting the form the screen should return to advertising mode.
Collected data can be appended to a csv file. 
After a configurable time of no keyboard activity it should return to Advertising mode.
Pressing escape should immediately return to Advertising Mode.


## Notes
* Use UV as the python project manager
* Optionally, can be run in full-screen mode to hide screen chrome
* It could use a browser for the UX
* It should have a config file for key parameters 
* The CSV file should be backed up every hour 
* Images, text, css from https://devtest.apitronix.com pages is available. This includes colour pallette.
* A dark background is preferred- it's running on an OLED laptop so this will save power and should look great!
* Fullscreen browser is likely to be fine, full kiosk mode not required.

## Fields for the registration form

1. Name
2. Company
3. Email address
4. Checkbox- keep me up-to-date default to checked.
5. Application area- free text box