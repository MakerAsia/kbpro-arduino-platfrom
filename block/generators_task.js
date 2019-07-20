module.exports = function(Blockly) {
  'use strict';

  Blockly.JavaScript['task_io_interrupt'] = function(block) {
    let value_pin = Blockly.JavaScript.valueToCode(block, 'pin', Blockly.JavaScript.ORDER_ATOMIC);
    let dropdown_type = block.getFieldValue('type');
    let statements_callback = Blockly.JavaScript.statementToCode(block, 'callback');
    let code = `#EXTINC#include "KBEvent.h"#END
#VARIABLE KBEvent kbevt;#END
kbevt.attach("",${dropdown_type},
  [](){
    ${statements_callback}
  },${value_pin});
\n`;
    return code;
  };

  Blockly.JavaScript['task_io_interrupt_ext'] = function(block) {
    let value_pin = Blockly.JavaScript.valueToCode(block, 'pin', Blockly.JavaScript.ORDER_ATOMIC);
    let dropdown_type = block.getFieldValue('type');
    let statements_callback = Blockly.JavaScript.statementToCode(block, 'callback');
    let code = `#EXTINC#include "KBEvent.h"#END
#VARIABLE KBEvent kbevt;#END
#BLOCKSETUP
kbevt.attach("",${dropdown_type},
  [](){
    ${statements_callback}
  },${value_pin});
#END
\n`;
    return code;
  };

  Blockly.JavaScript['task_timer_interrupt'] = function(block) {
    let text_taskname = block.getFieldValue('taskname');
    let value_delay = Blockly.JavaScript.valueToCode(block, 'delay', Blockly.JavaScript.ORDER_ATOMIC);
    let statements_callback = Blockly.JavaScript.statementToCode(block, 'callback');
    let code = `#EXTINC#include "KBEvent.h"#END
#VARIABLE KBEvent kbevt;#END
kbevt.attach("${text_taskname}",KBEventType::EVERY,
  [](){
    ${statements_callback}
  },${value_delay});
\n`;
    return code;
  };

  Blockly.JavaScript['task_timer_interrupt_ext'] = function(block) {
    let text_taskname = block.getFieldValue('taskname');
    let value_delay = Blockly.JavaScript.valueToCode(block, 'delay', Blockly.JavaScript.ORDER_ATOMIC);
    let statements_callback = Blockly.JavaScript.statementToCode(block, 'callback');
    let code = `#EXTINC#include "KBEvent.h"#END
#VARIABLE KBEvent kbevt;#END
#BLOCKSETUP
kbevt.attach("${text_taskname}",KBEventType::EVERY,
  [](){
    ${statements_callback}
  },${value_delay});
#END
\n`;
    return code;
  };

  Blockly.JavaScript['task_timer_interrupt_once'] = function(block) {
    let value_delay = Blockly.JavaScript.valueToCode(block, 'delay', Blockly.JavaScript.ORDER_ATOMIC);
    let statements_callback = Blockly.JavaScript.statementToCode(block, 'callback');
    let code = `#EXTINC#include "KBEvent.h"#END
#VARIABLE KBEvent kbevt;#END
kbevt.attach("",KBEventType::ONCE,
  [](){
    ${statements_callback}
  },${value_delay});
\n`;
    return code;
  };

  Blockly.JavaScript['task_timer_interrupt_once_ext'] = function(block) {
    let value_delay = Blockly.JavaScript.valueToCode(block, 'delay', Blockly.JavaScript.ORDER_ATOMIC);
    let statements_callback = Blockly.JavaScript.statementToCode(block, 'callback');
    let code = `#EXTINC#include "KBEvent.h"#END
#VARIABLE KBEvent kbevt;#END
#BLOCKSETUP
kbevt.attach("",KBEventType::ONCE,
  [](){
    ${statements_callback}
  },${value_delay});
#END
\n`;
    return code;
  };
  Blockly.JavaScript['task_task'] = function(block) {
    let statements_callback = Blockly.JavaScript.statementToCode(block, 'callback');
    let code = `#EXTINC#include "KBEvent.h"#END
#VARIABLE KBEvent kbevt;#END
kbevt.attach("",KBEventType::TASK,
  [](){
    ${statements_callback}
    vTaskDelete( NULL );
  },0);
\n`;
    return code;
  };
  Blockly.JavaScript['task_task_ext'] = function(block) {
    let statements_callback = Blockly.JavaScript.statementToCode(block, 'callback');
    let code = `#EXTINC#include "KBEvent.h"#END
#VARIABLE KBEvent kbevt;#END
#BLOCKSETUP
kbevt.attach("",KBEventType::TASK,
  [](){
    ${statements_callback}
    vTaskDelete( NULL );
  },0);
#END
\n`;
    return code;
  };
  Blockly.JavaScript['task_detach_timer'] = function(block) {
    let text_taskname = block.getFieldValue('taskname');
    let code = `#EXTINC#include "KBEvent.h"#END
#VARIABLE KBEvent kbevt;#END
kbevt.detach("${text_taskname}");\n`;
    return code;
  };
  Blockly.JavaScript['task_detach_gpio'] = function(block) {
    let value_pin = Blockly.JavaScript.valueToCode(block, 'pin', Blockly.JavaScript.ORDER_ATOMIC);
    let code = `#EXTINC#include "KBEvent.h"#END
#VARIABLE KBEvent kbevt;#END
kbevt.detach(${value_pin});\n`;
    return code;
  };
};