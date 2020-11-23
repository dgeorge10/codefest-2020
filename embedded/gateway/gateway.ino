#include <RH_NRF24.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <stdio.h>

// Replace all "TODO" with your wifi login, site login, device, and password
const char* ssid = "TODO";
const char* password = "TODO";
const char* serverName = "http://prieur.ml:3001/api/log_usage";
const char* userName = "TODO";
const char* userPassword = "TODO";
const char* userDevice = "TODO";

RH_NRF24 nrf24(2,4);
 
void setup() {
	Serial.begin(9600);
	while (!Serial);
	if (!nrf24.init()) {
		Serial.println("initialization failed");
	}
	if (!nrf24.setChannel(1)) {
		Serial.println("Channel set failed");
	}
	if (!nrf24.setRF(RH_NRF24::DataRate2Mbps, RH_NRF24::TransmitPower0dBm)) {
		Serial.println("RF set failed");
	}
	
	WiFi.mode(WIFI_STA);
	WiFi.begin(ssid, password);
	Serial.println("Connecting to WiFi");
	while (WiFi.status() != WL_CONNECTED) {
		Serial.print(".");
		delay(1000);
	}
	Serial.println("\nConnected to WiFi");
	Serial.println(WiFi.localIP());
}

void send_post_request(unsigned int flow_rate) {
	HTTPClient http;
	http.begin(serverName);
	
	float liter_amount = float(flow_rate) / 3600.00;
	/*
	char flt_tmp[30];
	dtostrf(liter_amount, 4, 10, flt_tmp);
	Serial.println(flt_tmp);
	*/
	http.addHeader("Content-Type", "application/json");
	char postBuffer[200];
	sprintf(postBuffer, "{\"username\":\"%s\",\"password\":\"%s\",\"device\":\"%s\",\"amount\":\%f\}", userName, userPassword, userDevice, liter_amount);
	
	String data = String((char*)postBuffer);
	Serial.println(data);
	
	int httpResponseCode = http.POST(data);
	Serial.println(httpResponseCode);
	
	http.end();
}

void loop() {
	if (nrf24.available()) {
		uint8_t buf[RH_NRF24_MAX_MESSAGE_LEN];
		uint8_t len = sizeof(buf);
		unsigned int flow_rate;
		if(nrf24.recv(buf, &len)) {
			memcpy(&flow_rate, &buf[0], sizeof(unsigned int));
			if(flow_rate > 0) {
				send_post_request(flow_rate);
			}
		} else {
			Serial.println("recv failed");
		}
	}
}
