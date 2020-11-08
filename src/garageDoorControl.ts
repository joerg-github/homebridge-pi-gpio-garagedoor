import { Logging } from 'homebridge';
import { EventEmitter } from '../node_modules/hap-nodejs/dist/lib/EventEmitter';

import { Gpio, BinaryValue } from 'onoff';

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
  private gpioSensorOpen: Gpio | undefined;
  private gpioSensorClose: Gpio | undefined;
  
  private pinLogicalState2BinaryValue(pin: number, pinLogicalState: PinLogicalState): BinaryValue {
    return (((this.pinActiveLow[pin] ? 1 : 0) ^ pinLogicalState) === 0 ? 0 : 1);
  }

  private binaryValue2pinLogicalState(pin: number, binaryValue: BinaryValue): PinLogicalState {
    return (this.pinActiveLow[pin] ? 1 : 0) ^ binaryValue;  
  }

  private pinStateToggle(pin: number, duration: number) {
    this.log.debug('pinStateToggle: pin: %s, duration: %s ', pin, duration);
    if (Gpio.accessible) {
      const gpio = new Gpio(pin, 'out', 'none', {activeLow: this.pinActiveLow[pin]});

      gpio.writeSync(this.pinLogicalState2BinaryValue(pin, PinLogicalState.ON));
      setTimeout(() => {
        gpio.writeSync(this.pinLogicalState2BinaryValue(pin, PinLogicalState.OFF));
        gpio.unexport;       
      }, duration);
    }
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

  private pinChanged(pin: number, value: BinaryValue) {
    this.log.debug('pinChanged: pin: %s, state: %s', pin, PinLogicalStateStr[value]);
    switch (pin) {
      case this.config.pinSensorClose:
        this.log.info('SpinChanged: ensor Close deteced');
        if (value === PinLogicalState.ON) {
          this.clearPositionTimeout;
          this.currentDoorState = ValueDoorState.CLOSED;
        }
        break;
      
      case this.config.pinSensorOpen:
        this.log.info('pinChanged: Sensor Open deteced');
        if (value === PinLogicalState.ON) {
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

    /* 
    this.pinActiveLow[config.pinSwitchOpen] = config.pinSwitchOpenActiveLow;
    log.debug('rpio.open(%s) as output', config.pinSwitchOpen);
    this.gpioOpen = new Gpio(config.pinSwitchOpen, 'out', 'none', {activeLow: config.pinSwitchOpenActiveLow});

    if (config.pinSwitchOpen !== config.pinSwitchClose) {
      this.pinActiveLow[config.pinSwitchClose] = config.pinSwitchCloseActiveLow;
      log.debug('rpio.open(%s) as output', config.pinSwitchClose);
      this.gpioClose = new Gpio(config.pinSwitchClose, 'out', 'none', {activeLow: config.pinSwitchCloseActiveLow});
    }
 */    
    if (Gpio.accessible) {
      if (config.pinSensorClose !== undefined) {
        this.pinActiveLow[config.pinSensorClose] = config.pinSensorCloseActiveOpen;
        log.debug('gpio.open(%s) as input', config.pinSensorClose);

        this.gpioSensorClose = new Gpio(config.pinSensorClose, 'in', 'both', {activeLow: config.pinSensorCloseActiveOpen});
        this.gpioSensorClose.watch((err, value) => {
          this.pinChanged(config.pinSensorClose as number, value);
        });
      }

      if (config.pinSensorOpen !== undefined) {
        this.pinActiveLow[config.pinSensorOpen] = config.pinSensorOpenActiveOpen;
        log.debug('gpio.open(%s) as input', config.pinSensorOpen);

        this.gpioSensorOpen = new Gpio(config.pinSensorOpen, 'in', 'both', {activeLow: config.pinSensorOpenActiveOpen});
        this.gpioSensorOpen.watch((err, value) => {
          this.pinChanged(config.pinSensorOpen as number, value);
        });
      }
    }
  }
}