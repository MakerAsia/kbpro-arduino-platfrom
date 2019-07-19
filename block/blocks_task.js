module.exports = function(Blockly) {
  'use strict';
  Blockly.Blocks['task_io_interrupt'] = {
    init: function() {
      this.appendValueInput("pin")
      .setCheck("Number")
      .appendField("on GPIO pin");
      this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown([["change","KBEventType::PIN_CHANGE"], ["falling","KBEventType::PIN_FALLING"], ["raising","KBEventType::PIN_RAISING"]]), "type");
      this.appendStatementInput("callback")
      .setCheck(null);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(225);
      this.setTooltip("catch event when digital GPIO has been change.");
      this.setHelpUrl("");
    }
  };
  Blockly.Blocks['task_io_interrupt_ext'] = {
    init: function() {
      this.appendValueInput("pin")
      .setCheck("Number")
      .appendField("on GPIO pin");
      this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown([["change","KBEventType::PIN_CHANGE"], ["falling","KBEventType::PIN_FALLING"], ["raising","KBEventType::PIN_RAISING"]]), "type");
      this.appendStatementInput("callback")
      .setCheck(null);
      this.setPreviousStatement(false, null);
      this.setNextStatement(false, null);
      this.setColour(225);
      this.setTooltip("catch event when digital GPIO has been change.");
      this.setHelpUrl("");
    }
  };
  Blockly.Blocks['task_timer_interrupt'] = {
    init: function() {
      let name = (Blockly.JavaScript.variableDB_)?Blockly.JavaScript.variableDB_.getDistinctName("MyJob","VARIABLE"):"MyJob";
      this.appendValueInput("delay")
        .setCheck("Number")
        .appendField("do ")
        .appendField(new Blockly.FieldTextInput(name), "taskname")
        .appendField("every");
      this.appendDummyInput()
      .appendField("milliseconds");
      this.appendStatementInput("callback")
        .setCheck(null);
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(225);
      this.setTooltip("do task periodically");
      this.setHelpUrl("");
    }
  };
  Blockly.Blocks['task_timer_interrupt_ext'] = {
    init: function() {
      let name = (Blockly.JavaScript.variableDB_)?Blockly.JavaScript.variableDB_.getDistinctName("MyJob","VARIABLE"):"MyJob";
      this.appendValueInput("delay")
      .setCheck("Number")
      .appendField("do ")
      .appendField(new Blockly.FieldTextInput(name), "taskname")
      .appendField("every");
      this.appendDummyInput()
      .appendField("milliseconds");
      this.appendStatementInput("callback")
      .setCheck(null);
      this.setInputsInline(true);
      this.setPreviousStatement(false, null);
      this.setNextStatement(false, null);
      this.setColour(225);
      this.setTooltip("do task periodically");
      this.setHelpUrl("");
    }
  };
  Blockly.Blocks['task_timer_interrupt_once'] = {
    init: function() {
      this.appendValueInput("delay")
      .setCheck("Number")
      .appendField("do")
      .appendField("after");
      this.appendDummyInput()
      .appendField("milliseconds");
      this.appendStatementInput("callback")
      .setCheck(null);
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(225);
      this.setTooltip("do task once");
      this.setHelpUrl("");
    }
  };
  Blockly.Blocks['task_timer_interrupt_once_ext'] = {
    init: function() {
      this.appendValueInput("delay")
      .setCheck("Number")
      .appendField("do")
      .appendField("after");
      this.appendDummyInput()
      .appendField("milliseconds");
      this.appendStatementInput("callback")
      .setCheck(null);
      this.setInputsInline(true);
      this.setPreviousStatement(false, null);
      this.setNextStatement(false, null);
      this.setColour(225);
      this.setTooltip("do task once");
      this.setHelpUrl("");
    }
  };
  Blockly.Blocks['task_task'] = {
    init: function() {
      this.appendDummyInput()
      .appendField("run task");
      this.appendStatementInput("callback")
      .setCheck(null);
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(225);
      this.setTooltip("start concurrent task");
      this.setHelpUrl("");
    }
  };
  Blockly.Blocks['task_task_ext'] = {
    init: function() {
      this.appendDummyInput()
      .appendField("run task");
      this.appendStatementInput("callback")
      .setCheck(null);
      this.setInputsInline(true);
      this.setPreviousStatement(false, null);
      this.setNextStatement(false, null);
      this.setColour(225);
      this.setTooltip("start concurrent task");
      this.setHelpUrl("");
    }
  };
  Blockly.Blocks['task_detach_timer'] = {
    init: function() {
      this.appendDummyInput()
      .appendField("stop task")
      .appendField(new Blockly.FieldTextInput("MyJob"), "taskname");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("detach running task");
      this.setHelpUrl("");
    }
  };
  Blockly.Blocks['task_detach_gpio'] = {
    init: function() {
      this.appendValueInput("pin")
      .setCheck("Number")
      .appendField("stop GPIO interrupt pin");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("detach gpio interrupt task");
      this.setHelpUrl("");
    }
  };
};