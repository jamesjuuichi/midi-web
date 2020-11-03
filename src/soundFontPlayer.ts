import Soundfont from "soundfont-player";
import state from "./state";
import { friendlyInstrumentNames, toDataSetMapping } from "./instruments";

// TODO: Refine with as const friendlyInstrumentNames, got TS error back then
export async function fetchInstrument(
  instrumentName: typeof friendlyInstrumentNames[number]
) {
  const instrumentNameInDataSet = toDataSetMapping[instrumentName];
  console.log(instrumentName, instrumentNameInDataSet);
  return Soundfont.instrument(
    new AudioContext(),
    instrumentNameInDataSet as Soundfont.InstrumentName
  ).then(function (instrument) {
    state.activeInstrument = instrumentNameInDataSet;
    state.instruments[instrumentNameInDataSet] = instrument;
  });
}
