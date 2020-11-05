// Mutable state, nothing is atomic, don't destruct state.
///  <reference types="@types/webmidi"/>
import { instrumentNames } from "./instruments";
import { MK2Colors } from "./constants";
import Soundfont from "soundfont-player";

type SubGridState = {
  instrument: typeof instrumentNames[number] | null;
  startNote: string | null;
  color: number;
};

const defaultSubGridState: SubGridState = {
  instrument: null,
  startNote: null,
  color: 0
};

export enum SubGrid {
  topLeft = "topLeft",
  topRight = "topRight",
  bottomLeft = "bottomLeft",
  bottomRight = "bottomRight"
}

type SubGridParts = {
  [K in keyof typeof SubGrid]: SubGridState;
};

// TODO: Refine with as const instrumentNames, got TS error back then
type Instruments = {
  [K in typeof instrumentNames[number]]?: Soundfont.Player;
};

type State = SubGridParts & {
  connected: boolean;
  midiInput: WebMidi.MIDIInput | null;
  midiOutput: WebMidi.MIDIOutput | null;
  activeGrid: SubGrid | null;
  activeInstrument: typeof instrumentNames[number] | null;
  instruments: Instruments;
};

const state: State = {
  connected: false,
  midiInput: null,
  midiOutput: null,
  activeGrid: null,
  activeInstrument: null,
  topLeft: { ...defaultSubGridState, color: MK2Colors.cyan },
  topRight: { ...defaultSubGridState, color: MK2Colors.red },
  bottomLeft: { ...defaultSubGridState, color: MK2Colors.yellow },
  bottomRight: { ...defaultSubGridState, color: MK2Colors.violet },
  instruments: {}
};

export default state;
