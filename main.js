function init(key, tableName, email) {
  const form = FormApp.create("Dynamic Form Initialization");

  // Add key, tableName, and email as hidden form fields
  form.addTextItem()
    .setTitle("Email")
    .setRequired(true)


  form.addTextItem()
    .setTitle("Key")
    .setRequired(true)

  form.addTextItem()
    .setTitle("Table Name")
    .setRequired(true)


  // Set up the trigger for form submission
  var trigger = ScriptApp.newTrigger("onInitFormSubmit")
    .forForm(form)
    .onFormSubmit()
    .create();
}

// Function to handle form submission for init form
function onInitFormSubmit(e) {
  var formResponse = e.response;
  var key = getResponseValue(formResponse, "Key");
  var tableName = getResponseValue(formResponse, "Table Name");
  var email = getResponseValue(formResponse, "Email");

  createFormFromTable(key, tableName, email);
}

// Helper function to get response value based on the item title
function getResponseValue(formResponse, title) {
  var itemResponses = formResponse.getItemResponses();

  for (var i = 0; i < itemResponses.length; i++) {
    var itemResponse = itemResponses[i];
    if (itemResponse.getItem().getTitle() === title) {
      return itemResponse.getResponse();
    }
  }

  return null;
}

// Function to create a form from a table
function createFormFromTable(key, tableName, email) {
  const result = VaultGS.evaluate({
    key: key,
    action: "read",
    type: "table",
    table: tableName,
    columnInfo: true,
    page: 1,
    limit: 0,
  });

  createForm(result.columns, tableName, key, email);
}

// Function to create a form based on columns and set up a trigger for form submission
function createForm(columns, tableName, key, email) {
  const form = FormApp.create(tableName);

  columns.forEach((c) => {
    var item;

    if (c.name === "id") {
      return;
    }

    if (c.dataType === "string") {
      console.log("string");
      item = form.addParagraphTextItem();
    } else if (c.dataType === "integer") {
      console.log("integer");
      item = form.addTextItem();
      item.setValidation(FormApp.createTextValidation().setHelpText("Input must be an integer").requireNumber().build());
    } else if (c.dataType === "float") {
      console.log("float");
      item = form.addTextItem();
      item.setValidation(FormApp.createTextValidation().setHelpText("Input must be a number").requireNumber().build());
    } else if (c.dataType === "boolean") {
      console.log('boolean');
      item = form.addCheckboxItem();
    } else if (c.dataType === "json") {
      console.log("json");
      item = form.addParagraphTextItem();
      item.setHelpText("JSON value");
    }

    item.setTitle(c.name);
  });

  // Send email to the form creator with the form link and QR code
  sendEmailWithFormLinkAndQRCode(form, email);

  // Set up the trigger for form submission and store the key and tableName
  var trigger = ScriptApp.newTrigger("onFormSubmit").forForm(form).onFormSubmit().create();
  setupTriggerArguments(trigger, { key: key, tableName: tableName }, false);
}

// Function to handle form submission
function onFormSubmit(e) {
  var triggerUid = e.triggerUid;
  var triggerArgs = handleTriggered(triggerUid);

  var key = triggerArgs.key;
  var tableName = triggerArgs.tableName;

  var responseObject = convertResponseToObject(e.response);

  console.log(responseObject);

  var subject;
  var body;

  try {
    const result = VaultGS.evaluate({
      key: key,
      action: "create",
      type: "entry",
      table: tableName,
      entry: responseObject
    });

    // Email content on success
    subject = 'Form Submission Successful';
    body = `Thank you for your submission to ${tableName}. Here are your responses:\n\n${JSON.stringify(responseObject, null, 2)}\n\nYour submission was successful.`;

  } catch (error) {
    // Email content on error
    subject = 'Form Submission Error';
    body = `There was an error processing your submission to ${tableName}. \n\nError Details:\n${error.message}`;

    console.error('Error creating entry in the database:', error);
  }

  // Send email to the fixed email address
  MailApp.sendEmail({
    to: email,
    subject: subject,
    body: body
  });
}

// Function to convert a form response to an object
function convertResponseToObject(formResponse) {
  var responseObj = {};
  var itemResponses = formResponse.getItemResponses();

  for (var i = 0; i < itemResponses.length; i++) {
    var itemResponse = itemResponses[i];
    var questionTitle = itemResponse.getItem().getTitle();
    var response = itemResponse.getResponse();

    // Add the question-response pair to the object
    responseObj[questionTitle] = response;
  }

  return responseObj;
}

// Function to send an email with the form link and QR code
function sendEmailWithFormLinkAndQRCode(form, email) {
  var formUrl = form.getPublishedUrl();
  var qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(formUrl)}`;
  var subject = "Your Form is Ready!";
  var body = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 5px;
          }
          .form-link {
            margin-bottom: 20px;
          }
          .qr-code {
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>${subject}</h2>
          <p>Here is the link to your form:</p>
          <p class="form-link">${formUrl}</p>
          <p>Scan the QR code below to access the form:</p>
          <div class="qr-code">
            <img src="${qrCodeUrl}" alt="QR Code" width="150" height="150">
          </div>
        </div>
      </body>
    </html>
  `;

  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: body
  });
}

