module.exports = function(Blockly) {
  "use strict";

  Blockly.Blocks["mqtt_block"] = {
    init: function() {

      this.appendDummyInput()
        .appendField(new Blockly.FieldImage(
          "https://image.flaticon.com/icons/svg/138/138617.svg",
          24,
          24,
          "*"))
        .appendField("MQTT Begin");
      this.appendDummyInput()
        .setAlign(Blockly.ALIGN_LEFT)
        .appendField("HOST")
        .appendField(new Blockly.FieldTextInput("mqtt.cmmc.io"),
          "MQTT_HOST");
      this.appendDummyInput()
        .setAlign(Blockly.ALIGN_LEFT)
        .appendField("USERNAME")
        .appendField(new Blockly.FieldTextInput(""), "MQTT_USERNAME");
      this.appendDummyInput()
        .setAlign(Blockly.ALIGN_LEFT)
        .appendField("PASSWORD")
        .appendField(new Blockly.FieldTextInput(""), "MQTT_PASSWORD");
      this.appendDummyInput()
        .setAlign(Blockly.ALIGN_LEFT)
        .appendField("PORT")
        .appendField(new Blockly.FieldTextInput("1883"), "MQTT_PORT");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(260);
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks["mqtt_connect_block"] = {
    init: function() {

      let clientId = "CLIENT-" +
        Math.random().toString(36).substring(5).toUpperCase();

      this.appendDummyInput()
        .appendField(new Blockly.FieldImage(
          "https://image.flaticon.com/icons/svg/148/148833.svg",
          24,
          24,
          "*"))
        .appendField("CONNECT")
        .appendField(new Blockly.FieldTextInput(clientId), "MQTT_CLIENT_ID");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(260);
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks["mqtt_publish_block"] = {
    init: function() {
      this.appendDummyInput()
        .appendField(new Blockly.FieldImage(
          "https://image.flaticon.com/icons/svg/148/148832.svg",
          24,
          24,
          "*"))
        .appendField("MQTT PUBLISH");
      this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("TOPIC")
        .appendField(new Blockly.FieldTextInput("KBIDE/"), "MQTT_TOPIC");
      this.appendValueInput("NAME")
        .setCheck(null)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("DATA");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks["mqtt_subscribe_block"] = {
    init: function() {
      this.appendDummyInput()
        .appendField(new Blockly.FieldImage(
          "https://image.flaticon.com/icons/svg/148/148834.svg",
          24,
          24,
          "*"))
        .appendField("MQTT SUBSCRIBE")
        .appendField(new Blockly.FieldTextInput("KBIDE/"), "MQTT_SUB_TOPIC");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks["mqtt_callback_block"] = {
    init: function() {
      this.appendDummyInput()
        .appendField(new Blockly.FieldImage(
          "https://image.flaticon.com/icons/svg/1122/1122395.svg",
          24,
          24,
          "*"))
        .appendField("MQTT CALLBACK message arrived (topic, payload)")
        // .appendField(new Blockly.FieldTextInput(""), "MQTT_SUB_TOPIC");
        // .appendField(new Blockly.FieldVariable("topic"), "MQTT_SUB_TOPIC");
      // this.appendDummyInput()
        // .appendField("Payload name(payload)")
        // .appendField(new Blockly.FieldTextInput(""), "MQTT_SUB_PAYLOAD");
        // .appendField(new Blockly.FieldVariable("payload"), "MQTT_SUB_PAYLOAD");
      this.appendStatementInput("MQTT_STATEMENT")
        .setCheck(null);
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(20);
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks["mqtt_condition_block"] = {
    init: function() {
      this.appendDummyInput()
        .appendField(new Blockly.FieldImage(
          "https://image.flaticon.com/icons/svg/234/234158.svg",
          32,
          32,
          "*"))
        .appendField("MQTT CONDITION TOPIC")
        .appendField(new Blockly.FieldTextInput(""), "MQTT_CONDITION_TOPIC");
      this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("PAYLOAD STORE IN")
        .appendField(new Blockly.FieldVariable(null), "MQTT_STORE");
      this.appendStatementInput("NAME")
        .setCheck(null);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(20);
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks["mqtt_loop_block"] = {
    init: function() {
      this.appendDummyInput()
        .appendField(new Blockly.FieldImage(
          "https://image.flaticon.com/icons/svg/148/148833.svg",
          24,
          24,
          "*"))
        .appendField("MQTT LOOP");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(260);
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['topic_block'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("topic");
      this.setOutput(true, null);
      this.setColour(210);
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };
  
  Blockly.Blocks['payload_block'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("payload");
      this.setOutput(true, null);
      this.setColour(210);
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };

};
