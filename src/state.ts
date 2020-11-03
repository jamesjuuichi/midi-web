// Mutable state, nothing is atomic, don't destruct state.
///  <reference types="@types/webmidi"/>
import { instrumentNames } from "./instruments";
import Soundfont from "soundfont-player";

type SubGridState = {
  instrument: string;
  startNote: string;
  color: 0;
};

const defaultSubGridState: SubGridState = {
  instrument: "",
  startNote: "",
  color: 0
};

enum SubGrid {
  topLeft,
  topRight,
  bottomLeft,
  bottomRight
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
  topLeft: { ...defaultSubGridState },
  topRight: { ...defaultSubGridState },
  bottomLeft: { ...defaultSubGridState },
  bottomRight: { ...defaultSubGridState },
  instruments: {}
};

export default state;
