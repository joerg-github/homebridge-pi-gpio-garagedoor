import {
  AccessoryConfig,
  AccessoryPlugin,
  API,
  Characteristic,
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  CharacteristicValue,
  HAP,
  Logging,
  Service,
} from 'homebridge';
import { GarageDoorAccessoryConfig } from './garageDoorAccessoryConfig';
import { GarageDoorConfig } from './garageDoorConfig';
import { 
  GarageDoorControl,
  GarageDoorControlEventTypes, 
} from './garageDoorControl';


let hap: HAP;

/*
 * Initializer function called when the plugin is loaded.
 */
export = (api: API) => {
  hap = api.hap;
  api.registerAccessory('homebridge-pi-gpio-garagedoor', 'GarageDoor', GarageDoor);
};

class GarageDoor implements AccessoryPlugin {

  private readonly log: Logging;
  private readonly name: string;
  private garageDoorConfig: GarageDoorConfig;
  private garageDoorControl: GarageDoorControl;

  private readonly garageDoorOpenerService: Service;
  private readonly informationService: Service;
  private characteristicCurrentDoorState: Characteristic;
  private characteristicCurrentPosition: Characteristic;

  constructor(log: Logging, config: AccessoryConfig) {
    this.log = log;
    this.name = config.name;
    this.garageDoorConfig = new GarageDoorAccessoryConfig(log, config);

    this.garageDoorOpenerService = new hap.Service.GarageDoorOpener(this.name);

    // -- CurrentDoorState -- https://developer.apple.com/documentation/homekit/hmcharacteristictypecurrentdoorstate
    this.characteristicCurrentDoorState = this.garageDoorOpenerService
      .getCharacteristic(hap.Characteristic.CurrentDoorState)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        callback(undefined, this.garageDoorControl.currentDoorState);
      })
      .on(CharacteristicEventTypes.SET, (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
        this.garageDoorControl.currentDoorState = value as number;
        callback();
      });

    // -- TargetDoorState -- https://developer.apple.com/documentation/homekit/hmcharacteristictypetargetdoorstate
    this.garageDoorOpenerService
      .getCharacteristic(hap.Characteristic.TargetDoorState)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        callback(undefined, this.garageDoorControl.targetDoorState);
      })
      .on(CharacteristicEventTypes.SET, (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
        this.garageDoorControl.targetDoorState = value as number;
        callback();
      });  

    // -- CurrentPosition -- https://developer.apple.com/documentation/homekit/hmcharacteristictypecurrentposition
    this.characteristicCurrentPosition = this.garageDoorOpenerService
      .getCharacteristic(hap.Characteristic.CurrentPosition)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        callback(undefined, this.garageDoorControl.currentPosition);
      })
      .on(CharacteristicEventTypes.SET, (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
        this.garageDoorControl.currentPosition = value as number;
        callback();
      });  
    
    
    this.informationService = new hap.Service.AccessoryInformation()
      .setCharacteristic(hap.Characteristic.Manufacturer, 'Jörg Mika')
      .setCharacteristic(hap.Characteristic.Model, 'Raspberry Pi GPIO Garage Door');


    this.garageDoorControl = new GarageDoorControl(log, this.garageDoorConfig);
    this.garageDoorControl.on(GarageDoorControlEventTypes.CHANGE, () => {
      this.characteristicCurrentDoorState.setValue(this.garageDoorControl.currentDoorState);

      this.characteristicCurrentPosition.setValue(this.garageDoorControl.currentPosition);
    });
  

    log.info('GarageDoor finished initializing!');
  }

  /*
   * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
   * Typical this only ever happens at the pairing process.
   */
  identify(): void {
    this.log('Identify!');
  }

  /*
   * This method is called directly after creation of this instance.
   * It should return all services which should be added to the accessory.
   */
  getServices(): Service[] {
    return [
      this.informationService,
      this.garageDoorOpenerService,
    ];
  }

}