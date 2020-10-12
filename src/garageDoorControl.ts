import { Logging } from 'homebridge';
import { GarageDoorConfig } from './garageDoorConfig';

enum CurrentDoorState {
  OPEN = 0,
  CLOSED = 1
//    OPENING = 2;
//    CLOSING = 3;
//    STOPPED = 4;
}

enum TargetDoorState {
    OPEN = 0,
    CLOSED = 1
}  

export class GarageDoorControl {

  currentDoorState: CurrentDoorState;
  targetDoorState: TargetDoorState;

  constructor(log: Logging, config: GarageDoorConfig) {

    log.info('Initializing GarageDoorControl');

    this.currentDoorState = CurrentDoorState.CLOSED;
    this.targetDoorState = TargetDoorState.CLOSED;

  }
}