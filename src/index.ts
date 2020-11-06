import {
  bindLaunchpadControl,
  bindSelect,
  bindRegions,
  bindRootNoteInput
} from "./eventListeners";
bindLaunchpadControl(() => {
  const regions = Array.from(document.querySelectorAll(".dot-wrapper"));
  bindRegions(regions);
});

const instrumentSelect = document.getElementById("instrument-select-wrapper");
if (instrumentSelect) {
  bindSelect(instrumentSelect);
}

const rootInput = document.getElementById("root-input");
if (rootInput) {
  bindRootNoteInput(rootInput);
}
