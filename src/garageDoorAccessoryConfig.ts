import {
  AccessoryConfig,
  Logging,
} from 'homebridge';

import { GarageDoorConfig } from './garageDoorConfig';

export class GarageDoorAccessoryConfig implements GarageDoorConfig {

  name: string;
  pinSwitchOpen: number;
  pinSwitchOpenIsInverted: boolean;
  pinSwitchOpenPulsDuration: number;
  pinSensorOpen: number;
  pinSendoropenIsInverted: boolean;
  durationOpen: number;
  durationClose: number;

  constructor(log: Logging, config: AccessoryConfig) {

    log.info('Initializing GarageDoorAccessoryConfig!');
    this.name = config.name;

    if (typeof config.pinSwitchOpen === 'number') {
      this.pinSwitchOpen = config.pinSwitchOpen as number;
    } else {
      throw new Error(`Configuration error. pinSwitchOpen expected number, got '${config.pinSwitchOpen}'.`);
    }

    if (typeof config.pinSwitchOpenIsInverted === 'boolean') {
      this.pinSwitchOpenIsInverted = config.pinSwitchOpenIsInverted as boolean;
    } else {
      throw new Error(`Configuration error. pinSwitchOpenIsInverted expected number, got '${config.pinSwitchOpenIsInverted}'.`);
    }

    if (typeof config.pinSwitchOpenPulsDuration === 'number') {
      this.pinSwitchOpenPulsDuration = config.pinSwitchOpenPulsDuration as number;
    } else {
      throw new Error(`Configuration error. pinSwitchOpenPulsDuration expected number, got '${config.pinSwitchOpenPulsDuration}'.`);
    }
      
    if (typeof config.pinSensorOpen === 'number') {
      this.pinSensorOpen = config.pinSensorOpen as number;
    } else {
      throw new Error(`Configuration error. pinSensorOpen expected number, got '${config.pinSensorOpen}'.`);
    }

    if (typeof config.pinSendoropenIsInverted === 'boolean') {
      this.pinSendoropenIsInverted = config.pinSendoropenIsInverted as boolean;
    } else {
      throw new Error(`Configuration error. pinSendoropenIsInverted expected number, got '${config.pinSwitchOpenIsInverted}'.`);
    }

    if (typeof config.durationOpen === 'number') {
      this.durationOpen = config.durationOpen as number;
    } else {
      throw new Error(`Configuration error. durationOpen expected number, got '${config.durationOpen}'.`);
    }

    if (typeof config.durationClose === 'number') {
      this.durationClose = config.durationClose as number;
    } else {
      throw new Error(`Configuration error. durationClose expected number, got '${config.durationClose}'.`);
    }
  }
}
