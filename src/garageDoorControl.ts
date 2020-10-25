import { Logging } from 'homebridge';
import { EventEmitter } from '../node_modules/hap-nodejs/dist/lib/EventEmitter';

import rpio = require('rpio');

import { GarageDoorConfig } from './garageDoorConfig';



enum ValueDoorState {
  OPEN = 0,
  CLOSED = 1,
  OPENING = 2,
  CLOSING = 3,
  STOPPED = 4
}

const ValueDoorStateStr: string[] = ['OPEN', 'CLOSED', 'OPENING', 'CLOSING', 'STOPPED'];

enum PositionState {
  CLOSING = 0,
  OPENING = 1,
  STOPPED = 2
}

const PositionStateStr: string[] = ['CLOSING', 'OPENING', 'STOPPED'];

enum PinLogicalState {
    OFF = 0,
    ON = 1
}

const PinLogicalStateStr: string[] = ['OFF', 'ON'];

enum RpioState {
    LOW = rpio.LOW,
    HIGH = rpio.HIGH
}

type NotifyCallBack = (garageDoorControl: GarageDoorControl) => void;

type DoorPosition = number;

export declare const enum GarageDoorControlEventTypes {
  CHANGE = 'change'
}

 declare type Events = {
  [GarageDoorControlEventTypes.CHANGE]: NotifyCallBack;
};

export class GarageDoorControl extends EventEmitter<Events> {

  private _currentDoorState: ValueDoorState = ValueDoorState.CLOSED;
  private _targetDoorState: ValueDoorState = ValueDoorState.CLOSED;
  private _positionState: PositionState = PositionState.STOPPED;
  private _currentPosition: DoorPosition = 0;
  private _targetPosition: DoorPosition = 0;
  private currentPositionIntervall!: ReturnType<typeof setInterval>;
  private currentPositionTimeout!: ReturnType<typeof setTimeout>;
  private pinActiveLow: boolean[] = [];
  
  private pinLogicalState2rpioState(pin: number, pinLogicalState: PinLogicalState): RpioState {
    return (this.pinActiveLow[pin] ? 1 : 0) ^ pinLogicalState;
  }

  private rpioState2pinLogicalState(pin: number, rpioState: RpioState): PinLogicalState {
    return (this.pinActiveLow[pin] ? 1 : 0) ^ rpioState;  
  }

  private pinStateRead(pin: number): PinLogicalState {
    return this.rpioState2pinLogicalState(pin, rpio.read(pin));
  }

  private pinStateToggle(pin: number, duration: number) {
    this.log.debug('pinStateToggle: pin: %s, duration: %s ', pin, duration);
    rpio.write(pin, this.pinLogicalState2rpioState(pin, PinLogicalState.ON));
    setTimeout(() => {
      rpio.write(pin, this.pinLogicalState2rpioState(pin, PinLogicalState.OFF));
    }, duration);
  }

  private triggerDoorOperation(positionState: PositionState) {
    this.log.debug('triggerDoorOperation: %s', PositionStateStr[positionState]);

    switch (positionState) {
      case PositionState.CLOSING:
        this.pinStateToggle(this.config.pinSwitchClose, this.config.pinSwitchClosePulsDuration);
        break;
    
      case PositionState.OPENING:
        this.pinStateToggle(this.config.pinSwitchOpen, this.config.pinSwitchOpenPulsDuration);
        break;

      case PositionState.STOPPED:
        break;
    }
  }

  private pinChanged(pin: number) {
    this.log.debug('pinChanged: pin: %s, state: %s', pin, PinLogicalStateStr[this.pinStateRead(pin)]);
    switch (pin) {
      case this.config.pinSensorClose:
        this.log.info('SpinChanged: ensor Close deteced');
        if (this.pinStateRead(pin) === PinLogicalState.ON) {
          this.clearPositionTimeout;
          this.currentDoorState = ValueDoorState.CLOSED;
        }
        break;
      
      case this.config.pinSensorOpen:
        this.log.info('pinChanged: Sensor Open deteced');
        if (this.pinStateRead(pin) === PinLogicalState.ON) {
          this.clearPositionTimeout;
          this.currentDoorState = ValueDoorState.OPEN;
        }
        break;

      default:
        this.log.error('pinChanged: Upps. Unknown pin change detected.');
        break;
    }
  }

  private clearPositionTimeout() {
    this.log.debug('clearPositionTimeout');
    clearInterval(this.currentPositionIntervall);
    clearTimeout(this.currentPositionTimeout);
  }

  public get currentDoorState(): ValueDoorState {
    return this._currentDoorState;       
  }

  public set currentDoorState(value: ValueDoorState) {
    if (this._currentDoorState !== value) {
      this.log.info('Set currentDoorState: %s, is: %s', ValueDoorStateStr[value], ValueDoorStateStr[this._currentDoorState]);   
      this._currentDoorState = value;
      switch (value) {
        case ValueDoorState.CLOSED:
          this._currentPosition = 0;
          this._positionState = PositionState.STOPPED;
          break;
    
        case ValueDoorState.OPEN:
          this._currentPosition = 100;
          this._positionState = PositionState.STOPPED;
          break;

        case ValueDoorState.OPENING:
          this._positionState = PositionState.OPENING;
          break;

        case ValueDoorState.CLOSING:
          this._positionState = PositionState.CLOSING;
          break;

        case ValueDoorState.STOPPED:
          this._positionState = PositionState.STOPPED;
          break;

        default:
          break;
      } 
      this.emit(GarageDoorControlEventTypes.CHANGE);
    }
  }

  public get targetDoorState(): ValueDoorState {
    return this._targetDoorState;
  }

  public set targetDoorState(value: ValueDoorState) {
    if (this._targetDoorState !== value) {         
      this.log.info('Set targetDoorState: %s, is %s', ValueDoorStateStr[value], ValueDoorStateStr[this._targetDoorState]);
      this._targetDoorState = value;
  
      switch (value) {
        case ValueDoorState.CLOSED:
          this.targetPosition = 0;
          break; 

        case ValueDoorState.OPEN:
          this.targetPosition = 100;
          break;

        default:
          break;
      }
      this.emit(GarageDoorControlEventTypes.CHANGE);
    }
  }

  public get currentPosition(): DoorPosition {
    return this._currentPosition;
  }

  public set currentPosition(value: DoorPosition) {
    if (this._currentPosition !== value) {
      this.log.debug('Set currentPosition: %s, is %s', value, this._currentPosition);

      this._currentPosition = value;

      if (value === 0) {
        this._currentDoorState = ValueDoorState.CLOSED;
      } else if (value === 100) {
        this._currentDoorState = ValueDoorState.OPEN;
      }
      this.emit(GarageDoorControlEventTypes.CHANGE);
    }
  }

  public get targetPosition(): DoorPosition {
    return this._targetPosition;
  }

  public set targetPosition(value: DoorPosition) {
    let difPosition: DoorPosition;
    let duration: number;
    let delayDoorTrigger = 0;
    const newPositionState: PositionState = (value > this.currentPosition ? PositionState.OPENING : PositionState.CLOSING);
    
    if (this._targetPosition !== value) {
      this.log.debug('Set targetPosition: %s, is: %s', value, this._targetPosition);
      this._targetPosition = value;

      // check if door is moving in the oppesite diretion
      if (this.positionState !== PositionState.STOPPED) {
        if (newPositionState !== this.positionState ) {
          this.log.info('Door is moving alread. Stopping Door');                
          this.triggerDoorOperation(newPositionState);
          delayDoorTrigger = (newPositionState === PositionState.CLOSING 
            ? this.config.pinSwitchClosePulsDuration
            : this.config.pinSwitchOpenPulsDuration) + this.config.pinSwitchConsecutiveCallDelay;
        }
        this.clearPositionTimeout();
      }

      difPosition = Math.abs(this.targetPosition - this.currentPosition);
      this.log.debug('Door position diff: %s', difPosition);
      if (newPositionState === PositionState.OPENING) {
        duration = Math.round(difPosition / 100 * this.config.durationOpen);   
        this.currentPositionIntervall = setInterval(() => {
          this.currentPosition++;
        }, this.config.durationOpen / 100);       
      } else {
        duration = Math.round(difPosition / 100 * this.config.durationClose);          
        this.currentPositionIntervall = setInterval(() => {
          this.currentPosition--;
        }, this.config.durationClose / 100);       
      }

      this.positionState = newPositionState;

      this.currentPositionTimeout = setTimeout(() => {
        this.log.debug('currentPositionTimeout');
        clearInterval(this.currentPositionIntervall);

        this._positionState = PositionState.STOPPED;
        this.currentPosition = this.targetPosition;
      }, duration);

      if (delayDoorTrigger > 0) {
        setTimeout(() => {
          this.triggerDoorOperation(newPositionState);
        }, delayDoorTrigger);
      } else {
        this.triggerDoorOperation(newPositionState);    
      }
      
            
    } else {
      this.log.debug('Current postion matches target postion %s', value);
    }  
  }

  public get positionState(): PositionState {
    return this._positionState;
  }

  public set positionState(value: PositionState) {
    if (this._positionState !== value) {
      this.log.info('Set positionState: %s, is %s', PositionStateStr[value], PositionStateStr[this._positionState]);
      this._positionState = value;
      
      switch (value) {
        case PositionState.CLOSING:
          this._currentDoorState = ValueDoorState.CLOSING;
          break;
      
        case PositionState.OPENING:
          this._currentDoorState = ValueDoorState.OPENING;
          break;

        case PositionState.STOPPED:
          this._currentDoorState = ValueDoorState.STOPPED;
          break;

        default:
          break;
      }
      this.emit(GarageDoorControlEventTypes.CHANGE);           
    }
  }

  constructor(private log: Logging, private config: GarageDoorConfig) {
    super();

    log.info('Initializing GarageDoorControl');

    rpio.init({
      mapping: 'physical',
    });

    this.pinActiveLow[config.pinSwitchOpen] = config.pinSwitchOpenActiveLow;
    rpio.open(config.pinSwitchOpen, rpio.OUTPUT, this.pinLogicalState2rpioState(config.pinSwitchOpen, PinLogicalState.OFF));

    if (config.pinSwitchOpen !== config.pinSwitchClose) {
      this.pinActiveLow[config.pinSwitchClose] = config.pinSwitchCloseActiveLow;
      rpio.open(config.pinSwitchClose, rpio.OUTPUT, this.pinLogicalState2rpioState(config.pinSwitchClose, PinLogicalState.OFF));
    }
    
    if (config.pinSensorClose !== undefined) {
      this.pinActiveLow[config.pinSensorClose] = config.pinSensorCloseActiveOpen;
      rpio.open(config.pinSensorClose, rpio.INPUT, rpio.PULL_UP);
      rpio.poll(config.pinSensorClose, this.pinChanged, rpio.POLL_BOTH);
    }
    if (config.pinSensorOpen !== undefined) {
      this.pinActiveLow[config.pinSensorOpen] = config.pinSensorOpenActiveOpen;
      rpio.open(config.pinSensorOpen, rpio.INPUT, rpio.PULL_UP);
      rpio.poll(config.pinSensorOpen, this.pinChanged, rpio.POLL_BOTH);
    }
  }
}