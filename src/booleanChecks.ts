///  <reference types="@types/webmidi"/>
import { MIDI_CONTROLLER_NAME, MANUFACTURER } from "./constants";
import { GridInput } from "./types";

export function isLaunchPad(midiPort: WebMidi.MIDIPort) {
  if (
    midiPort.name === MIDI_CONTROLLER_NAME &&
    midiPort.manufacturer === MANUFACTURER
  ) {
    return true;
  }
  return false;
}

export function isGridInput(data: number[]): data is GridInput {
  return data.length === 3 && data[0] === 144;
}

export function isNoteOn(data: GridInput) {
  return data[2] === 127;
}

export function isNoteOff(data: GridInput) {
  return data[2] === 0;
}
