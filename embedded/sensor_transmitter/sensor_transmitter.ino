#include <RH_NRF24.h>
#include <LiquidCrystal.h>

RH_NRF24 nrf24;

volatile int flow_frequency; // Measures flow sensor pulses
unsigned int l_hour; // Calculated litres/hour
unsigned char flowsensor = 2; // Sensor Input
unsigned long currentTime;
unsigned long cloopTime;
void flow () // Interrupt function
{
   flow_frequency++;
}

void setup() {
   pinMode(flowsensor, INPUT);
   digitalWrite(flowsensor, HIGH); // Optional Internal Pull-Up
   Serial.begin(9600);
   attachInterrupt(0, flow, RISING); // Setup Interrupt
   sei(); // Enable interrupts
   currentTime = millis();
   cloopTime = currentTime;
  
	Serial.begin(9600);
	while (!Serial);
	
	if (!nrf24.init()) {
		Serial.println("initialization failed");
	}		
	if (!nrf24.setChannel(1)) {
		Serial.println("Channel Set failed");
	}
	if (!nrf24.setRF(RH_NRF24::DataRate2Mbps, RH_NRF24::TransmitPower0dBm)) {
		Serial.println("RF set failed");
	}
}

void transmit_data(unsigned int flow_rate) {
	Serial.println("Sending data to receiver");
	Serial.println(flow_rate, DEC);
	nrf24.send((uint8_t *)&flow_rate,sizeof(flow_rate));
	nrf24.waitPacketSent();
}

void loop() {
   currentTime = millis();
   // Every second, calculate and print litres/hour
   if(currentTime >= (cloopTime + 1000))
   {
      cloopTime = currentTime; // Updates cloopTime
      // Pulse frequency (Hz) = 7.5Q, Q is flow rate in L/min.
      l_hour = (flow_frequency * 60 / 7.5); // (Pulse frequency x 60 min) / 7.5Q = flowrate in L/hour
      flow_frequency = 0; // Reset Counter
	  transmit_data(l_hour);
   }
}
