# Dynamic Form Generator

This repository contains a Google Apps Script for dynamically creating Google Forms based on Vault.gs data tables. The script automates the process of form creation, submission handling, and data storage using Vault.gs.

## Overview

The main script (`main.js`) along with `vault.js` and `trigger.js` facilitates the following functionalities:

- **Initialization:** Generates a Google Form with fields corresponding to the columns of a specified data table.
- **Form Submission Handling:** Processes form submissions and stores the data in the designated table.
- **Email Notification:** Sends an email notification to the provided email address upon successful form submission, containing a link to the form and a QR code for quick access.

## Getting Started

To use this script, follow these steps:

1. **Copy Scripts:**
   - Copy the contents of `main.js`, `vault.js`, and `trigger.js`.
   - Open the Google Apps Script editor in your Google Drive.
   - Create three new scripts and paste the respective contents into each.

2. **Run Initialization:**
   - Run the `init()` function in the `main.js` script.
   - This will create a Google Form.

3. **Fill Form Information:**
   - Fill out the form fields with the required information: `key`, `tableName`, and `email`.

4. **Submit Form:**
   - Submit the form.

5. **Check Email:**
   - Upon successful form submission, you will receive an email containing a link to the created form and a QR code for quick access.

## Usage

Once the initialization is complete and the form is submitted, the script will handle subsequent form submissions automatically. Data will be stored in the designated Google Sheets table, and email notifications will be sent to the provided email address.

## Dependencies

This script relies on the following services:

- **Google Apps Script:** Used for scripting custom functions within Google Sheets and Forms.
- **Vault.gs:** Used for reading and writing to database.
