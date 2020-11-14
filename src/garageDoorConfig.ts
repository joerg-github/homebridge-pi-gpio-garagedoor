export interface GarageDoorConfig {
    name: string;
    pinSwitchOpen: number;
    pinSwitchOpenPulsDuration: number;
    pinSwitchClose: number;
    pinSwitchClosePulsDuration: number;
    pinSwitchConsecutiveCallDelay: number; 
    pinSensorOpen: number | undefined;
    pinSensorOpenActiveOpen: boolean;
    pinSensorClose: number | undefined;
    pinSensorCloseActiveOpen: boolean;
    durationOpen: number;
    durationClose: number;
}

