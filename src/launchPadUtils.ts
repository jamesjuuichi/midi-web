///  <reference types="@types/webmidi"/>
import { MIDI_CONTROLLER_NAME, REGION_STARTS } from "./constants";
import { GridInput } from "./types";
import { SubGrid } from "./state";

export function isLaunchPad(midiPort: WebMidi.MIDIPort) {
  if (midiPort.name && midiPort.name.startsWith(MIDI_CONTROLLER_NAME)) {
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

export function findRegion(buttonIndex: number): SubGrid | undefined {
  const unit = buttonIndex % 10;
  const tens = Math.floor(buttonIndex / 10);
  const horizontal = unit < 1 || unit > 8 ? undefined : unit < 5 ? 0 : 1;
  const vertical = tens < 1 || tens > 8 ? undefined : tens >= 5 ? 0 : 1;
  console.log(unit, tens, horizontal, vertical);
  if (horizontal == null || vertical == null) {
    return undefined;
  }
  const numeralIndex = horizontal + 2 * vertical;
  switch (numeralIndex) {
    case 0:
      return SubGrid.topLeft;
    case 1:
      return SubGrid.topRight;
    case 2:
      return SubGrid.bottomLeft;
    case 3:
      return SubGrid.bottomRight;
    default:
      return undefined;
  }
}
export function getButtonIndex(buttonIndex: number, region: SubGrid) {
  const startIndex = REGION_STARTS[region];
  const relativeIndex = buttonIndex - startIndex;
  const unit = relativeIndex % 10;
  const tens = Math.floor(relativeIndex / 10);
  if (tens < 0 || tens > 3 || unit < 0 || unit > 3) {
    return -1;
  }
  return unit + tens * 4;
}

function getNoteIndex(note: string) {
  switch (note) {
    case "C":
      return 0;
    case "Db":
      return 1;
    case "D":
      return 2;
    case "Eb":
      return 3;
    case "E":
      return 4;
    case "F":
      return 5;
    case "Gb":
      return 6;
    case "G":
      return 7;
    case "Ab":
      return 8;
    case "A":
      return 9;
    case "Bb":
      return 10;
    case "B":
      return 11;
    default:
      return undefined;
  }
}

function getNoteSymbol(index: number) {
  switch (index) {
    case 0:
      return "C";
    case 1:
      return "Db";
    case 2:
      return "D";
    case 3:
      return "Eb";
    case 4:
      return "E";
    case 5:
      return "F";
    case 6:
      return "Gb";
    case 7:
      return "G";
    case 8:
      return "Ab";
    case 9:
      return "A";
    case 10:
      return "Bb";
    case 11:
      return "B";
    default:
      return undefined;
  }
}

const matchingRegex = /^([ABDEG]b?|[CF])([1-7])$/;
export function noteToNumber(note: string): number | undefined {
  // Edge cases
  switch (note) {
    case "A0":
      return 0;
    case "Bb0":
      return 1;
    case "B0":
      return 2;
    case "C8":
      return 87;
  }
  const matched = note.match(matchingRegex);
  if (matched == null) {
    return;
  }
  const noteIndex = getNoteIndex(matched[1]);
  const octave = parseInt(matched[2], 10);
  if (noteIndex == null || Number.isNaN(octave)) {
    return;
  }
  return noteIndex + (octave - 1) * 12 + 3;
}

export function numberToNote(noteIndex: number): string | undefined {
  if (noteIndex < 0 || noteIndex > 87) {
    return;
  }
  switch (noteIndex) {
    case 0:
      return "A0";
    case 1:
      return "Bb0";
    case 2:
      return "B0";
    case 87:
      return "C8";
  }
  const unit = (noteIndex - 3) % 12;
  const twelves = Math.floor((noteIndex - 3) / 12);
  const symbol = getNoteSymbol(unit);
  if (!symbol) {
    // There is no way for this to happen, but type check
    return;
  }
  return symbol + (twelves + 1).toString();
}

/**
 * Range: A0 -> C8, half steps using flat notation only
 * String to number: A0 -> 0, C8 -> 87
 */
export function getRelativeNote(
  rootNote: string,
  semitones: number
): string | undefined {
  const rootIndex = noteToNumber(rootNote);
  if (rootIndex == null) {
    console.warn("Cannot find note: " + rootNote);
    return;
  }
  const noteToPlay = numberToNote(rootIndex + semitones);
  if (noteToPlay == null) {
    console.warn("Note " + rootIndex + semitones + "  is out of range");
  }

  return noteToPlay;
}
