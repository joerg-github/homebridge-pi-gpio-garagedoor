export interface GarageDoorConfig {
    name: string;
    pinSwitchOpen: number;
    pinSwitchOpenActiveLow: boolean;
    pinSwitchOpenPulsDuration: number;
    pinSwitchClose: number;
    pinSwitchCloseActiveLow: boolean;
    pinSwitchClosePulsDuration: number;
    pinSwitchConsecutiveCallDelay: number; 
    pinSensorOpen: number | undefined;
    pinSensorOpenActiveOpen: boolean;
    pinSensorClose: number | undefined;
    pinSensorCloseActiveOpen: boolean;
    durationOpen: number;
    durationClose: number;
}

