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

  private _currentDoorState: CurrentDoorState = CurrentDoorState.CLOSED;
  private _targetDoorState: TargetDoorState = TargetDoorState.CLOSED;

  public get currentDoorState(): CurrentDoorState {
    return this._currentDoorState;       
  }

  public set currentDoorState(DoorState: CurrentDoorState) {
    this._currentDoorState = DoorState;
  }

  public get targetDoorState(): TargetDoorState {
    return this._targetDoorState;
  }

  public set targetDoorState(value: TargetDoorState) {
    this._targetDoorState = value;
    
    this.currentDoorState = value as number;
  }


  constructor(log: Logging, config: GarageDoorConfig) {

    log.info('Initializing GarageDoorControl');

    this.targetDoorState = TargetDoorState.CLOSED;

  }
}