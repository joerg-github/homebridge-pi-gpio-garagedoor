import {
  AccessoryConfig,
  AccessoryPlugin,
  API,
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
import { GarageDoorControl } from './garageDoorControl';


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

  constructor(log: Logging, config: AccessoryConfig) {
    this.log = log;
    this.name = config.name;
    this.garageDoorConfig = new GarageDoorAccessoryConfig(log, config);
    this.garageDoorControl = new GarageDoorControl(log, this.garageDoorConfig);

    this.garageDoorOpenerService = new hap.Service.GarageDoorOpener(this.name);

    // https://developer.apple.com/documentation/homekit/hmcharacteristictypecurrentdoorstate
    this.garageDoorOpenerService.getCharacteristic(hap.Characteristic.CurrentDoorState)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        log.info('Current door state was returned: ' + this.garageDoorControl.currentDoorState);
        callback(undefined, this.garageDoorControl.currentDoorState);
      })
      .on(CharacteristicEventTypes.SET, (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
        this.garageDoorControl.currentDoorState = value as number;
        log.info('Curretn door state was set to: ' + this.garageDoorControl.currentDoorState);
        callback();
      });

    // https://developer.apple.com/documentation/homekit/hmcharacteristictypetargetdoorstate
    this.garageDoorOpenerService.getCharacteristic(hap.Characteristic.TargetDoorState)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        log.info('Target door state was returned: ' + this.garageDoorControl.targetDoorState);
        callback(undefined, this.garageDoorControl.targetDoorState);
      })
      .on(CharacteristicEventTypes.SET, (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
        this.garageDoorControl.targetDoorState = value as number;
        log.info('Target door state was set to: ' + this.garageDoorControl.targetDoorState);
        callback();
      });  

    this.informationService = new hap.Service.AccessoryInformation()
      .setCharacteristic(hap.Characteristic.Manufacturer, 'Custom Manufacturer')
      .setCharacteristic(hap.Characteristic.Model, 'Custom Model');

    log.info('Switch finished initializing!');
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