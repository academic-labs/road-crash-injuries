// Intro page: the visitor picks how they travel. The choice is remembered for chapters 2 and 3.
import * as S from "./shared.js";

const state = { travel: S.loadTravel() };
function update() {
  S.markTravel(state.travel);
  document.querySelector("#travel-showing").textContent = `Your story follows: ${S.TRAVEL[state.travel].label}`;
}
S.initTravelBar(state, update);
update();
