#include <Arduino.h>
#include "KBEvent.h"

Boolean toggle = 1;
KBEvent kbevt;
void blink()
{
    digitalWrite(2,1);
    delay(500);
    digitalWrite(2,0);
    delay(500);
}
void startBlink()
{
    if (toggle) {
        kbevt.attach("MyJob",KBEventType::EVERY,blink,1000);
    } else {
        kbevt.detach("MyJob");
    }
    toggle = !toggle;
}
void setup()
{
    pinMode(14,INPUT_PULLUP);
    pinMode(2,OUTPUT);
    kbevt.attach("button_push",KBEventType::PIN_FALLING,startBlink,14);
}
void loop()
{
    delay(500);
}