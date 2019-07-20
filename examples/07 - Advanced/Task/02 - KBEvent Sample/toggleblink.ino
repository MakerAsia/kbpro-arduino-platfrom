#include <Arduino.h>
#include "KBEvent.h"

Boolean toggle = 1;
KBEvent kbevt;
void led()
{
    toggle = !toggle;
    digitalWrite(2,toggle);
}
void setup()
{  
  pinMode(14,INPUT_PULLUP);
  pinMode(2,OUTPUT);
  kbevt.attach("toggle_task",KBEventType::PIN_FALLING,led,14);
}
void loop()
{
  
  
}