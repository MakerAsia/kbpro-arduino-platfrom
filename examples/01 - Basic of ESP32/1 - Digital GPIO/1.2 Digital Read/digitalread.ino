#include <Arduino.h>
void setup()
{
  pinMode(16,INPUT_PULLUP);
  pinMode(2,OUTPUT);
}
void loop()
{
  if (digitalRead(16) == 0) {
    digitalWrite(2,1);
  } else {
    digitalWrite(2,0);
  }
}