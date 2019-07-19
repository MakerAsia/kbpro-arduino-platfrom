module.exports = function(Blockly) {
  'use strict';

  Blockly.JavaScript['task_io_interrupt'] = function(block) {
    var value_pin = Blockly.JavaScript.valueToCode(block, 'pin', Blockly.JavaScript.ORDER_ATOMIC);
    var dropdown_type = block.getFieldValue('type');
    var statements_callback = Blockly.JavaScript.statementToCode(block, 'callback');
    var code = `#EXTINC#include "KBEvent.h"#END
#VARIABLE KBEvent kbevt;#END
kbevt.attach("",${dropdown_type},
  [](){
    ${statements_callback}
  },${value_pin});
\n`;
    return code;
  };

  Blockly.JavaScript['task_timer_interrupt'] = function(block) {
    var text_taskname = block.getFieldValue('taskname');
    var value_delay = Blockly.JavaScript.valueToCode(block, 'delay', Blockly.JavaScript.ORDER_ATOMIC);
    var statements_callback = Blockly.JavaScript.statementToCode(block, 'callback');
    var code = `#EXTINC#include "KBEvent.h"#END
#VARIABLE KBEvent kbevt;#END
kbevt.attach("${text_taskname}",KBEventType::EVERY,
  [](){
    ${statements_callback}
  },${value_delay});
\n`;
    return code;
  };

  Blockly.JavaScript['task_timer_interrupt_once'] = function(block) {
    var value_delay = Blockly.JavaScript.valueToCode(block, 'delay', Blockly.JavaScript.ORDER_ATOMIC);
    var statements_callback = Blockly.JavaScript.statementToCode(block, 'callback');
    var code = `...;\n`;
    return code;
  };
  Blockly.JavaScript['task_detach_timer'] = function(block) {
    var text_taskname = block.getFieldValue('taskname');
    var code = `#EXTINC#include "KBEvent.h"#END
#VARIABLE KBEvent kbevt;#END
kbevt.detach("${text_taskname}");\n`;
    return code;
  };
  Blockly.JavaScript['task_detach_gpio'] = function(block) {
    var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
    var code = `...;\n`;
    return code;
  };
};