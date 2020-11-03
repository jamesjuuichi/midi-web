///  <reference types="@types/webmidi"/>
import state from "./state";
import { randomInt } from "./utils";
import { isLaunchPad, isGridInput, isNoteOn } from "./booleanChecks";
import { TRANSITION_TIME } from "./constants";
import { fetchInstrument } from "./soundFontPlayer";

// #region MIDI
function doMIDIFeedback(
  message: WebMidi.MIDIMessageEvent,
  decay: number = 500
) {
  const { midiOutput } = state;
  if (!midiOutput) {
    return;
  }
  const clonedData = Array.from(message.data);
  if (!isGridInput(clonedData)) {
    return;
  }

  if (isNoteOn(clonedData)) {
    if (midiOutput) {
      midiOutput.send([clonedData[0], clonedData[1], randomInt(128)]);
      midiOutput.send(
        [clonedData[0], clonedData[1], 0],
        message.timeStamp + decay
      );
    }
  }
}

function playActiveInstrument(message: WebMidi.MIDIMessageEvent) {
  const { activeInstrument, instruments } = state;
  if (!activeInstrument) {
    return;
  }
  console.log(activeInstrument, "a");
  const instrument = instruments[activeInstrument];
  if (!instrument) {
    return;
  }
  console.log(instrument, "b");
  instrument.play("C4");
}

function getMIDIMessage(message: WebMidi.MIDIMessageEvent) {
  doMIDIFeedback(message);
  playActiveInstrument(message);
}

// TODO: Multiple controllers
function onMIDISuccess(midiAccess: WebMidi.MIDIAccess) {
  const inputs = Array.from(midiAccess.inputs.values());
  const outputs = Array.from(midiAccess.outputs.values());
  const connectionStatus = document.getElementById("connection-status");
  const controls = document.getElementById("controls");

  for (var input of inputs) {
    const toSetEvent = isLaunchPad(input);
    if (toSetEvent) {
      state.connected = true;
      if (connectionStatus) {
        connectionStatus.classList.remove("not-connected", "not-supported");
        connectionStatus.classList.add("connected");
      }
      if (controls) {
        controls.classList.add("expanded");
        setTimeout(() => {
          controls.classList.add("overflow-visible");
        }, TRANSITION_TIME);
      }
      input.addEventListener("midimessage", getMIDIMessage);
      state.midiInput = input;
    }
  }

  for (var output of outputs) {
    const toSetEvent = isLaunchPad(output);
    if (toSetEvent && state.connected) {
      state.midiOutput = output;
    }
  }
}

function onMIDIFailure() {
  console.log("Could not access your MIDI devices.");
}

export function bindLaunchpadControl(onSuccess?: () => void) {
  const refreshButton = document.getElementById("refresh-connection");
  const connectionStatus = document.getElementById("connection-status");
  if (!refreshButton || !connectionStatus) {
    return;
  }

  refreshButton.addEventListener("click", () => {
    if (typeof navigator.requestMIDIAccess === "function") {
      navigator.requestMIDIAccess().then((midiAccess: WebMidi.MIDIAccess) => {
        onMIDISuccess(midiAccess);
        if (typeof onSuccess === "function") {
          onSuccess();
        }
      }, onMIDIFailure);
    } else {
      connectionStatus.classList.remove("not-connected", "connected");
      connectionStatus.classList.add("not-supported");
    }
  });
}
// #endregion

// #region Input

function toggleOptions() {
  const list = document.getElementById("instrument-options");
  if (!list) {
    return;
  }
  list.classList.toggle("active");
}
export function bindInputControl() {
  const select = document.getElementById("instrument-select");
  const options = document.querySelectorAll(".instrument-option");
  if (!select) {
    return;
  }
  const firstOption = select.querySelector("option");

  select.addEventListener("click", () => {
    select.blur();
    toggleOptions();
  });
  options.forEach((option) => {
    option.addEventListener("click", () => {
      const instrument = (option as HTMLDivElement).innerText.toLowerCase();
      if (instrument.match(/^[A-Za-z]+$/) && firstOption) {
        firstOption.innerText = instrument;
      }
      toggleOptions();
      fetchInstrument(instrument);
    });
  });
}
// #endregion
