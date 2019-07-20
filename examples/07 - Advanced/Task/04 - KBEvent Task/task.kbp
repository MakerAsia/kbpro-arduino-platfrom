#include <Arduino.h>
#include "KBEvent.h"
KBEvent kbevt;
void task1()
{
  while(1) {
    digitalWrite(17,1);
    delay(100);
    digitalWrite(17,0);
    delay(100);
  }
  vTaskDelete( NULL );
}
void task2()
{
  while(1) {
    digitalWrite(2,1);
    delay(500);
    digitalWrite(2,0);
    delay(500);
  }
  vTaskDelete( NULL );
}
void setup()
{
  pinMode(17,OUTPUT);
  pinMode(2,OUTPUT);
  pinMode(15,OUTPUT);
  kbevt.attach("task1",KBEventType::TASK,task1,0);
  kbevt.attach("task2",KBEventType::TASK,task2,0);
}
void loop()
{
  digitalWrite(15,1);
  delay(1000);
  digitalWrite(15,0);
  delay(1000);
}