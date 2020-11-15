import csv 
import requests 
import xml.etree.ElementTree as ET 
import os

TEMPORARY_FILENAME = 'tmp_weather.xml'
  
def load_xml(latitude, longitude, file_to_write): 
    # URL of weather predictions
    url = 'https://forecast.weather.gov/MapClick.php?lat='+str(latitude)+'&lon='+str(longitude)+'&FcstType=digitalDWML&product=time-series'
  
    # Create HTTP response object from url
    resp = requests.get(url) 
  
    # Save the xml file temporarily
    with open(file_to_write, 'wb') as f: 
        f.write(resp.content) 

def unfold_xml_element(elm):
    unfolded_elm = []
    for child in elm:
        unfolded_elm.append(int(child.text))
    return unfolded_elm
          
  
def parse_xml(xmlfile): 
    # Create element tree object 
    tree = ET.parse(xmlfile) 
  
    # Get root element 
    root = tree.getroot()
    for child in root:
        if child.tag == 'data':
            data = child
            for data_child in data:
                if data_child.tag == 'time-layout':
                    time_layout = data_child
                if data_child.tag == 'parameters':
                    parameters = data_child

    # Get time intervals
    time_start = []
    time_end = []
    for child in time_layout:
        if child.tag.startswith('start'):
            time_start.append(child.text)
        if child.tag.startswith('end'):
            time_end.append(child.text)

    # Get forecast
    for parameter in parameters:
        if parameter.tag == 'temperature':
            temperature = parameter
        elif parameter.tag == 'cloud-amount':
            cloud_amount = parameter
        elif parameter.tag == 'probability-of-precipitation':
            precipitation_probability = parameter
        elif parameter.tag == 'humidity':
            humidity = parameter

    # Unpack forecast
    values_temperature = unfold_xml_element(temperature)
    values_cloud_amount = unfold_xml_element(cloud_amount)
    values_precipitation_probability = unfold_xml_element(precipitation_probability)
    values_humidity = unfold_xml_element(humidity)

    # Parse as list of JSON
    time_intervals = []
    for ts, te, vt, vc, vp, vh in zip(time_start, time_end, values_temperature, values_cloud_amount, values_precipitation_probability, values_humidity):
        time_interval = {'time_start': ts, 'time_end': te, 'temperature': vt, 'cloud_amount': vc, 'precipitation_probability': vp, 'humidity': vh}
        time_intervals.append(time_interval)
    return time_intervals
  
if __name__ == "__main__": 
    latitude = '32.832909'
    longitude = '-96.793159'

    # Load data from weather prediction
    load_xml(latitude, longitude, TEMPORARY_FILENAME)
  
    # Parse temporary xml file 
    time_intervals = parse_xml(TEMPORARY_FILENAME)
    os.remove(TEMPORARY_FILENAME)
    print(time_intervals)