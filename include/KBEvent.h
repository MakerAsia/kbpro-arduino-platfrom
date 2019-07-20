#ifndef KBEVENT_H
#define KBEVENT_H

#include <Arduino.h>
#include <FunctionalInterrupt.h>

extern "C" {
  #include "esp_timer.h"
}
#include <vector>
#include <deque>
#include <stdlib.h>

enum KBEventType
{
      NONE,
      PIN_CHANGE,
      PIN_RAISING,
      PIN_FALLING,
      EVERY,
      ONCE,
      TASK
};
enum KBEventExecuteType{
        SEQUENTIAL,
        PARALLEL
};
static portMUX_TYPE kb_mux = portMUX_INITIALIZER_UNLOCKED;

class KBEvent
{
    typedef void (*kb_callback_t)(void);
    typedef void (*kb_callback_with_arg_t)(void*);

    struct KBIsrArg {
        const char *name;
        uint16_t uid;
        KBEvent *mother;
        kb_callback_with_arg_t cb;
        uint32_t param;
        void *arg;
        KBEventType event_type;
        KBEventExecuteType queue_type;
        esp_timer_handle_t timer;
    };

    protected:
        std::vector<KBIsrArg> subscribers;
        std::deque<KBIsrArg *> queue;
        bool isSequenceTaskStarted = false;
    public:

        KBEvent::KBEvent(){
            subscribers.reserve(128);
        }

        KBEvent::~KBEvent() {
          //detach();
        }

        static void isr(void *arg) {
            KBIsrArg* c_arg = static_cast<KBIsrArg*>(arg);
            KBEvent *mother = c_arg->mother;
            portENTER_CRITICAL( &kb_mux );
            if(c_arg->queue_type == KBEventExecuteType::SEQUENTIAL){
                if(!mother->isSequenceTaskStarted){
                    xTaskCreate(&KBEvent::event_consumer, "KBEVENT_PULLING", 2048, mother, 10, NULL);
                    mother->isSequenceTaskStarted = true;
                }
                mother->enqueue(c_arg);
            }else if(c_arg->queue_type == KBEventExecuteType::PARALLEL){
                for(auto const&el : mother->subscribers){ //loop all member to check if multiple callback
                    if(el.queue_type == c_arg->queue_type &&
                        el.param == c_arg->param &&
                        el.event_type == c_arg->event_type){
                        xTaskCreate([](KBIsrArg *argc){
                            argc->cb(argc->arg);
                            vTaskDelete( NULL );
                        }, "KBEVENT_PTASK", 2048, &el, 128, NULL);
                    }
                }
            }
            portEXIT_CRITICAL( &kb_mux );
        }

        static void event_consumer(KBEvent *mother)
        {
            while(true)
            {
                while(mother->queue.size() > 0){
                   KBIsrArg *arg = mother->queue.front();
                   kb_callback_with_arg_t cb = arg->cb;
                   mother->queue.pop_front();
                   cb(arg->arg);
                }
                delay(1);
            }
            vTaskDelete( NULL );
        }
        void inline attach_master(
            const char *name,
            KBEventType type,
            KBEventExecuteType queue_type,
            kb_callback_with_arg_t callback,
            uint32_t param,
            void *arg)
        {
            uint16_t uid = rand();
            KBIsrArg subscriber = {
                name,
                uid,
                this,       //class instance
                callback,   //callback
                param,      //param
                arg,
                type,
                queue_type,
                NULL
            };
            //subscriber.name = new char [strlen(name) + 1];
            //strcpy(subscriber.name, name);
            taskENTER_CRITICAL( &kb_mux );
            switch(type){
                case KBEventType::PIN_CHANGE:
                    subscribers.push_back(subscriber);
                    attachInterruptArg(param,KBEvent::isr,&subscribers.back(),CHANGE);
                    //attachInterrupt(param, std::bind(&KBEvent::isr,this), CHANGE);
                    break;
                case KBEventType::PIN_FALLING:
                    subscribers.push_back(subscriber);
                    attachInterruptArg(param,KBEvent::isr,&subscribers.back(),FALLING);
                    break;
                case KBEventType::PIN_RAISING:
                    subscribers.push_back(subscriber);
                    attachInterruptArg(param,KBEvent::isr,&subscribers.back(),RISING);
                    break;
                case KBEventType::EVERY:
                    //check existing name
                    for(auto const &el : subscribers)
                    {
                        if(strcmp(el.name,name) == 0)
                        {
                            return;
                        }
                    }
                    esp_timer_create_args_t _timerConfig;
                    _timerConfig.arg = arg;
                    _timerConfig.callback = callback;
                    _timerConfig.dispatch_method = ESP_TIMER_TASK;
                    _timerConfig.name = "Ticker";
                    subscriber.timer = {0};
                    esp_timer_create(&_timerConfig, &subscriber.timer);
                    esp_timer_start_periodic(subscriber.timer, param * 1000);
                    subscribers.push_back(subscriber);
                    break;
                case KBEventType::ONCE:
                    esp_timer_create_args_t _timerConfig_once;
                    _timerConfig_once.arg = arg;
                    _timerConfig_once.callback = callback;
                    _timerConfig_once.dispatch_method = ESP_TIMER_TASK;
                    _timerConfig_once.name = "Ticker";
                    subscriber.timer = {0};
                    esp_timer_create(&_timerConfig_once, &subscriber.timer);
                    esp_timer_start_once(subscriber.timer, param * 1000);
                    subscribers.push_back(subscriber);
                    break;
                case KBEventType::TASK:
                    const char *task_name = String(uid).c_str();
                    xTaskCreate(callback,task_name, 2048, arg, 128, NULL);
            }
            taskEXIT_CRITICAL( &kb_mux );
        }
        void inline attach(const char *name,KBEventType type,KBEventExecuteType queue_type,kb_callback_t callback,uint32_t param)
        {
            attach_master(name,type,queue_type,reinterpret_cast<kb_callback_with_arg_t>(callback), param,NULL);
        }
        template<typename TArg>
        void inline attach(const char *name,KBEventType type,KBEventExecuteType queue_type,void (*callback)(TArg),uint32_t param, TArg arg)
        {
            void *ptr;
            memcpy(&ptr, &arg, sizeof arg);
            attach_master(name,type,queue_type,reinterpret_cast<kb_callback_with_arg_t>(callback), param, ptr);
        }
        void inline attach(const char *name, KBEventType type,kb_callback_t callback,uint32_t param)
        {
            attach_master(name,type,KBEventExecuteType::PARALLEL,reinterpret_cast<kb_callback_with_arg_t>(callback), param,0);
        }
        template<typename TArg>
        void inline attach(const char *name, KBEventType type,void (*callback)(TArg),uint32_t param, TArg arg)
        {
            void *ptr;
            memcpy(&ptr, &arg, sizeof arg);
            attach_master(name,type,KBEventExecuteType::PARALLEL,reinterpret_cast<kb_callback_with_arg_t>(callback), param, ptr);
        }
        void inline enqueue(KBIsrArg *el)
        {
            taskENTER_CRITICAL( &kb_mux );
            queue.push_back(el);
            taskEXIT_CRITICAL( &kb_mux );
        }
        void inline detach(uint32_t param)
        {
            taskENTER_CRITICAL( &kb_mux );
            for(std::vector<KBIsrArg>::iterator el = subscribers.begin(); el != subscribers.end(); el++)
            {
                if(el->param == param)
                {
                    if(disable_callback(el))
                    {
                        el--;
                    }
                }
            }
            taskEXIT_CRITICAL( &kb_mux );
        }
        void inline KBEvent::detach(const char * name)
        {
            taskENTER_CRITICAL( &kb_mux );
            for(auto el = subscribers.begin(); el != subscribers.end(); el++)
            {
                if(strcmp(name,el->name) == 0)
                {
                    //Serial.println(el->name);
                    if(disable_callback(el))
                    {
                        el--;
                    }
                }
            }
            taskEXIT_CRITICAL( &kb_mux );
        }
        void inline KBEvent::detach_all()
        {
            taskENTER_CRITICAL( &kb_mux );
            for(auto el = subscribers.begin(); el != subscribers.end(); el++)
            {
                if(disable_callback(el))
                {
                    el--;
                }
            }
            taskEXIT_CRITICAL( &kb_mux );
        }
    private:
        bool inline disable_callback(std::vector<KBIsrArg>::iterator el)
        {
            bool removed = false;
            taskENTER_CRITICAL( &kb_mux );
            if(el->event_type == KBEventType::PIN_CHANGE ||
                el->event_type == KBEventType::PIN_RAISING ||
                el->event_type == KBEventType::PIN_FALLING)
            {
                detachInterrupt(el->param);
                subscribers.erase(el);
                removed = true;
            }else if(el->event_type == KBEventType::EVERY ||
                el->event_type == KBEventType::ONCE)
            {
                if(el->timer && el->timer != nullptr){
                    esp_timer_stop(el->timer);
                    //esp_timer_delete(el->timer);// TODO : check here, this line cause error when detach
                    el->timer = nullptr;
                }
                subscribers.erase(el);
                removed = true;
            }
            taskEXIT_CRITICAL( &kb_mux );
            return removed;
        }
};
#endif  // KBEVENT_H