import { SubGrid } from "./state";
export const MIDI_CONTROLLER_NAME = "Launchpad MK2";

// NOTE: Seems like MANUFACTURER is hardcoded by OS, thus Mac and Windows shown different name. cannot use
export const MANUFACTURER = "Focusrite-Novation";

export const TRANSITION_TIME = 200;
export enum MK2Colors {
  red = 5,
  orange = 9,
  yellow = 13,
  green = 21,
  cyan = 33,
  sky = 37,
  blue = 45,
  purple = 49,
  violet = 53
}

export const REGION_STARTS: {
  [K in keyof typeof SubGrid]: number;
} = {
  topLeft: 51,
  topRight: 55,
  bottomLeft: 11,
  bottomRight: 15
};
