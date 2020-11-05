import {
  bindLaunchpadControl,
  bindSelect,
  bindRegions
} from "./eventListeners";
bindLaunchpadControl(() => {
  const regions = Array.from(document.querySelectorAll(".dot-wrapper"));
  bindRegions(regions);
});

const instrumentSelect = document.getElementById("instrument-select-wrapper");
if (instrumentSelect) {
  bindSelect(instrumentSelect);
}
