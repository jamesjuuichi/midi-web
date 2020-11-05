///  <reference types="@types/webmidi"/>
import state, { SubGrid } from "./state";
import { GridInput } from "./types";
import {
  isLaunchPad,
  isGridInput,
  isNoteOn,
  findRegion,
  getButtonIndex,
  getRelativeNote
} from "./launchPadUtils";
import { TRANSITION_TIME, REGION_STARTS } from "./constants";
import { toFriendlyMapping } from "./instruments";
import { fetchInstrument } from "./soundFontPlayer";

const MIDITimestamp = {
  startTime: 0
};

// TODO: Not working correctly now
function syncClock(message: WebMidi.MIDIMessageEvent) {
  const newStartTime = performance.now() - message.timeStamp;
  MIDITimestamp.startTime = newStartTime;
}

// #region MIDI
function doMIDIFeedback(message: WebMidi.MIDIMessageEvent) {
  const { midiOutput } = state;
  if (!midiOutput) {
    return;
  }
  const clonedData = Array.from(message.data);
  if (!isGridInput(clonedData)) {
    return;
  }

  if (isNoteOn(clonedData)) {
    const region = findRegion(clonedData[1]);
    if (!region) {
      return;
    }

    const { color } = state[region];

    if (!midiOutput || !color) {
      return;
    }

    midiOutput.send([clonedData[0], clonedData[1], color]);
  } else if (midiOutput) {
    midiOutput.send([clonedData[0], clonedData[1], 0]);
  }
}

function playActiveInstrument(message: WebMidi.MIDIMessageEvent) {
  const clonedData = Array.from(message.data);
  if (!isGridInput(clonedData)) {
    return;
  }

  if (isNoteOn(clonedData)) {
    const region = findRegion(clonedData[1]);
    if (!region) {
      return;
    }
    const { instrument, startNote } = state[region];

    if (!instrument || !startNote) {
      console.warn("Set not configured: " + region);
      return;
    }
    const loadedInstrument = state.instruments[instrument];

    if (!loadedInstrument) {
      console.warn("Instrument hasn't finished loading: " + instrument);
      return;
    }
    const index = getButtonIndex(clonedData[1], region);
    const note = getRelativeNote(startNote, index);

    if (note) {
      loadedInstrument.play(note);
    }
  }
}

function getMIDIMessage(message: WebMidi.MIDIMessageEvent) {
  syncClock(message);
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
      MIDITimestamp.startTime = performance.now();
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

// #region Instrument selector

function toggleOptions(wrapper: HTMLElement) {
  const list = wrapper.querySelector(".options");
  const select = wrapper.querySelector(".select");
  if (!list || !select) {
    return;
  }
  list.classList.toggle("active");
  select.classList.toggle("active");
}

export function bindSelect(wrapper: HTMLElement) {
  const select = wrapper.querySelector(".select");
  const options = wrapper.querySelectorAll(".option");
  if (!select || !(select instanceof HTMLDivElement)) {
    return;
  }

  window.addEventListener("click", () => {
    const list = wrapper.querySelector(".options");
    const select = wrapper.querySelector(".select");
    if (!list || !select || !list.classList.contains("active")) {
      return;
    }
    list.classList.remove("active");
    select.classList.remove("active");
  });
  select.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleOptions(wrapper);
  });
  options.forEach((option) => {
    option.addEventListener("click", async () => {
      const instrument = (option as HTMLDivElement).innerText.toLowerCase();
      if (instrument.match(/^[A-Za-z]+$/)) {
        select.innerText = instrument;
      }
      toggleOptions(wrapper);
      select.classList.add("disabled");
      const dataSetInstrumentName = await fetchInstrument(instrument);
      select.classList.remove("disabled");
      if (state.activeGrid) {
        const activeGrid = state[state.activeGrid];
        activeGrid.instrument = dataSetInstrumentName;
        // TODO: Become customizeable
        activeGrid.startNote = "C4";
      }
    });
  });
}
// #endregion

// #region Region selector
function validateRegionElement(
  region: Element
): { regionIndex: SubGrid; region: HTMLDivElement } | undefined {
  if (!(region instanceof HTMLDivElement)) {
    return;
  }
  const regionData = region.dataset["region"];
  const regionIndex =
    regionData && regionData in SubGrid ? (regionData as SubGrid) : undefined;
  if (!regionIndex) {
    return;
  }
  return {
    region,
    regionIndex
  };
}

function setRegionActive(
  lastActiveRegion: HTMLDivElement | undefined,
  activeRegion: HTMLDivElement,
  regionIndex: SubGrid
) {
  if (lastActiveRegion && lastActiveRegion.children.length) {
    lastActiveRegion.children[0].classList.remove("active");
  }
  if (activeRegion.children.length) {
    activeRegion.children[0].classList.add("active");
  }
  state.activeGrid = regionIndex;
  const selectInstrument = document.querySelector("#instrument-select");
  if (selectInstrument && selectInstrument instanceof HTMLDivElement) {
    const { instrument } = state[regionIndex];
    if (instrument != null) {
      selectInstrument.innerText = toFriendlyMapping[instrument];
    } else {
      selectInstrument.innerText = "";
    }
  }

  // Activate LEDs
  const leds = [REGION_STARTS[regionIndex]];
  leds.push(leds[0] + 3, leds[0] + 30, leds[0] + 33);

  const { midiOutput } = state;
  const { color } = state[regionIndex];

  if (!midiOutput || !color) {
    return;
  }

  const message: GridInput = [144, 0, 0];

  leds.forEach((led) => {
    const instanceMessage = [...message];
    instanceMessage[1] = led;
    instanceMessage[2] = color;
    midiOutput.send(instanceMessage);
    instanceMessage[2] = 0;
    setTimeout(() => {
      midiOutput.send(instanceMessage);
    }, 300);
  });
}

function initializeActiveRegion(elementRegion: Element) {
  const validatedData = validateRegionElement(elementRegion);
  if (!validatedData) {
    return;
  }

  const { region, regionIndex } = validatedData;

  setRegionActive(undefined, region, regionIndex);
  return region;
}

export function bindRegions(regions: Element[]) {
  if (!regions.length) {
    return;
  }
  let currentActive = initializeActiveRegion(regions[0]);

  regions.forEach((regionElement) => {
    const validatedData = validateRegionElement(regionElement);

    if (!validatedData) {
      return;
    }

    const { region, regionIndex } = validatedData;
    region.addEventListener("click", () => {
      setRegionActive(currentActive, region, regionIndex);
      currentActive = region;
    });
  });
}
// #endregion
