import Soundfont from "soundfont-player";
import state from "./state";
import { friendlyInstrumentNames, toDataSetMapping } from "./instruments";

// TODO: Refine with as const friendlyInstrumentNames, got TS error back then
export async function fetchInstrument(
  instrumentName: typeof friendlyInstrumentNames[number]
): Promise<string> {
  const instrumentNameInDataSet = toDataSetMapping[instrumentName];
  if (state.instruments[instrumentNameInDataSet]) {
    return new Promise((resolve) => resolve(instrumentNameInDataSet));
  }
  return Soundfont.instrument(
    new AudioContext(),
    instrumentNameInDataSet as Soundfont.InstrumentName
  )
    .then(function (instrument) {
      state.instruments[instrumentNameInDataSet] = instrument;
    })
    .catch((e) => {
      console.error(e);
    })
    .then(() => {
      return instrumentNameInDataSet;
    });
}
