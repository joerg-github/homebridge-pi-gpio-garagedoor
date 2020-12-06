
<p align="center">

<img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>


# Homebridge Raspberry PI GPIO Garage Door Plugin

Homebridge Plugin to control a garage door via Raspberry PI GPIO pins.


## YAHP

Yet Another Homebridge Plugin

Of course there are already a lot of plugins for this purpose, but since I didn't find the one fitting exactly my needs, I thought this is a good opportunity to get more into TypeScript.

<!-- 
## Installation 

- Install Homebridge. See the [Homebridge documentation](https://github.com/nfarina/homebridge#readme) for more information.
- Install Plugin ```[sudo] npm install homebridge-pi-gpio-garagedoor```
 -->
## Homebrige configuration

The plug in can be configured using the settings page.
Of course you can also edit the JSON configuration directly.

Minimum configuration:
````
"accessories": [
  {
    "accessory": "GarageDoor",
    "name": "Garage",
    "pinSwitchOpen": 1
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


## Pin numbering

The pin numbers are identified by their physical header location: Pins 1 to 26 (A/B) or Pins 1 to 40 (A+/B+)<br/>
<img src="https://www.raspberrypi.org/documentation/usage/gpio/images/GPIO.png" width=500>
