
<p align="center">

<img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>


# Homebridge Raspberry PI GPIO Garage Door Plugin

Homebridge Plugin to control a garage door via Raspberry PI GPIO pins.


## Motivation

## Installation 

## Homebrige configuration

Sample configuration:
````
"accessories": [
  {
    "accessory": "GarageDoor",
    "name": "Garage",
    "pinSwitchOpen": 1,
    "pinSwitchOpenActiveLow": false,
    "pinSwitchOpenPulsDuration": 200,
    "pinSwitchClose": 2,
    "pinSwitchCloseActiveLow": false,
    "pinSwitchClosePulsDuration": 200,
    "pinSwitchConsecutiveCallDelay": 1000,
    "pinSensorClose": 2,
    "pinSensorCloseActiveOpen": false,   
    "pinSensorOpen": 2,
    "pinSensorCloseActiveOpen": false,
    "durationOpen": 10000,
    "durationClose": 10000
  }
]
````

Fields:

| Key | Default | Description |
|-|-:|-|
|**`accessory`**| | The name provided to Homebridge. Must be *GarageDoor*| 
|**`name`** | | The name of this accessory. Room with a garage door, probably *Garage*|
|**`pinSwitchOpen`**| | Out Pin to trigger the opening of the door |
|`pinSwitchOpenActiveLow` | false | false: open trigger is low-high-low, true: open trigger is high-low-high |
|`pinSwitchOpenPulsDuration`| 200 | time in milliseconds for the off-on-off puls |
|`pinSwitchClose` | | If set a seperate pin used to trigger the closing of the door. If not set the same pin as for opening is used |
|`pinSwitchCloseActiveLow` | false | Only effective if `pinSwitchClose`is set. See `pinSwitchOpenActiveLow`for meaning |
|`pinSwitchClosePulsDuration` | 200 | Only effective if `pinSwitchClose`is set. See `pinSwitchOpenPulsDuration`for meaning |
|`pinSwitchConsecutiveCallDelay` | 1000 | Delay in milliseconds between consecutive open/close trigger.
|`pinSensorClose` | | Pin to connect to door-is-closed sensor.
|`pinSensorCloseActiveOpen` | false | True: Door is closed is detected when sensor is open.
|`pinSensorOpen` | | Pin to connect to door-is-open sensor.
|`pinSensorCloseActiveOpen` | false | True: Door is open is detected when sensor is open.
|`durationOpen`| 10000 | Time in milliseconds to open a closed door completly
|`durationClose` | 10000 | Time in milliseconds to close an open door completly
