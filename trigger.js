// From Stack Overflow https://stackoverflow.com/questions/32697653/how-can-i-pass-a-parameter-to-a-time-based-google-app-script-trigger
// Constants for trigger properties
var RECURRING_KEY = "recurring";
var ARGUMENTS_KEY = "arguments";

// Function to set up trigger arguments
function setupTriggerArguments(trigger, functionArguments, recurring) {
  var triggerUid = trigger.getUniqueId();
  var triggerData = {};
  triggerData[RECURRING_KEY] = recurring;
  triggerData[ARGUMENTS_KEY] = functionArguments;

  PropertiesService.getScriptProperties().setProperty(triggerUid, JSON.stringify(triggerData));
}

// Function to handle trigger and retrieve arguments
function handleTriggered(triggerUid) {
  var scriptProperties = PropertiesService.getScriptProperties();
  var triggerData = JSON.parse(scriptProperties.getProperty(triggerUid));

  if (!triggerData[RECURRING_KEY]) {
    deleteTriggerByUid(triggerUid);
  }

  return triggerData[ARGUMENTS_KEY];
}

// Function to delete trigger arguments
function deleteTriggerArguments(triggerUid) {
  PropertiesService.getScriptProperties().deleteProperty(triggerUid);
}

// Function to delete trigger by UID
function deleteTriggerByUid(triggerUid) {
  if (!ScriptApp.getProjectTriggers().some(function (trigger) {
    if (trigger.getUniqueId() === triggerUid) {
      ScriptApp.deleteTrigger(trigger);
      return true;
    }
    return false;
  })) {
    console.error("Could not find trigger with id '%s'", triggerUid);
  }
  deleteTriggerArguments(triggerUid);
}

// Function to delete trigger
function deleteTrigger(trigger) {
  ScriptApp.deleteTrigger(trigger);
  deleteTriggerArguments(trigger.getUniqueId());
}
