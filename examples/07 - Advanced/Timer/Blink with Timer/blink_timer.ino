#include <Arduino.h>

#define LEDPIN 2

hw_timer_t *timer = NULL;

void onTimer(){
  digitalWrite(LEDPIN, !digitalRead(LEDPIN));
}

void setup() {
  pinMode(LEDPIN, OUTPUT);
  
  timer = timerBegin(0, 80, true);
  timerAttachInterrupt(timer, &onTimer, true);
  timerAlarmWrite(timer, 300000, true);
  timerAlarmEnable(timer);
}

void loop() {
  
}