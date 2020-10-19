import {
  AccessoryConfig,
  Logging,
} from 'homebridge';

import { GarageDoorConfig } from './garageDoorConfig';

export class GarageDoorAccessoryConfig implements GarageDoorConfig {

  name: string;
  pinSwitchOpen: number;
  pinSwitchOpenActiveLow: boolean;
  pinSwitchOpenPulsDuration: number;
  pinSwitchClose: number;
  pinSwitchCloseActiveLow: boolean;
  pinSwitchClosePulsDuration: number;
  pinSwitchConsecutiveCallDelay: number;
  pinSensorOpen: number | undefined = undefined;
  pinSensorOpenActiveOpen: boolean;
  pinSensorClose: number | undefined = undefined;
  pinSensorCloseActiveOpen: boolean;
  durationOpen: number;
  durationClose: number;

  constructor(log: Logging, config: AccessoryConfig) {

    log.info('Initializing GarageDoorAccessoryConfig!', config);
    this.name = config.name;

    if (typeof config.pinSwitchOpen === 'number') {
      this.pinSwitchOpen = config.pinSwitchOpen as number;
    } else {
      throw new Error(`Configuration error. pinSwitchOpen expected number, got '${config.pinSwitchOpen}'.`);
    }

    this.pinSwitchOpenActiveLow = config.pinSwitchOpenActiveLow ? config.pinSwitchOpenActiveLow as boolean : false;
    this.pinSwitchOpenPulsDuration = config.pinSwitchOpenPulsDuration ? config.pinSwitchOpenPulsDuration as number : 200;
    this.pinSwitchClose = config.pinSwitchClose ? config.pinSwitchClose as number : this.pinSwitchOpen;
    this.pinSwitchCloseActiveLow = config.pinSwitchCloseActiveLow ? 
      config.pinSwitchCloseActiveLow as boolean : this.pinSwitchOpenActiveLow;
    this.pinSwitchClosePulsDuration = config.pinSwitchClosePulsDuration ? 
      config.pinSwitchClosePulsDuration as number : this.pinSwitchOpenPulsDuration;
    this.pinSwitchConsecutiveCallDelay = config.pinSwitchConsecutiveCallDelay ? config.pinSwitchConsecutiveCallDelay as number : 1000;
    this.pinSensorOpen = config.pinSensorOpen as number;
    this.pinSensorOpenActiveOpen = config.pinSensorOpenActiveOpen ? config.pinSensorOpenActiveOpen as boolean : false;
    this.pinSensorClose = config.pinSensorClose as number;
    this.pinSensorCloseActiveOpen = config.pinSensorCloseActiveOpen ? config.pinSensorCloseActiveOpen as boolean : false;
    this.durationOpen = config.durationOpen ? config.durationOpen as number : 10000;
    this.durationClose = config.durationClose ? config.durationClose as number : this.durationOpen;
  }
}
