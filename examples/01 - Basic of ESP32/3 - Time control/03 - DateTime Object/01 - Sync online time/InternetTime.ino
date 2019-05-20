#include <Arduino.h>
#include "KBProTime.h"
#include <WiFi.h>

KBProTime kbprotime;

void setup()
{
  Serial.begin(115200);
  WiFi.begin("Your SSID","wifi password");
  while(WiFi.status() != WL_CONNECTED){
    delay(500);
  }
  kbprotime.sync();
}
void loop()
{
  Serial.println((
    (String("Date = ")+
     String(kbprotime.getYear())+
     String("/")+
     String(kbprotime.getMonth())+
     String("/")+
     String(kbprotime.getDayOfMonth())+
     String("  Time = ")+
     String(kbprotime.getHour())+
     String(":")+
     String(kbprotime.getMinute())+
     String(":")+
     String(kbprotime.getSecond())))
  );
  delay(1000);
}
