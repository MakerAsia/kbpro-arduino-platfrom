#include <Arduino.h>
#include "KBEvent.h"
KBEvent ev;

#define LED_PIN 17

void blink(int value)
{
  digitalWrite(LED_PIN,value);
}
void start()
{
  ev.attach("blink_off",KBEventType::EVERY,blink,500,1);
  ev.attach("blink_on",KBEventType::EVERY,blink, 1000,0);
}
void stop()
{
  ev.detach("blink_on");
  ev.detach("blink_off");
}
void setup()
{
  pinMode(16,INPUT_PULLUP);
  pinMode(14,INPUT_PULLUP);
  pinMode(LED_PIN,OUTPUT);
  ev.attach("start",KBEventType::PIN_FALLING,start,16);
  ev.attach("stop",KBEventType::PIN_FALLING,stop,14);
}
void loop()
{
  delay(100000);
}
