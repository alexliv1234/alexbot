## Slide 1: "Playing with AlexBot"

_This is the first time the bot appears. Walk-in plays fully, then audio + talk video start together._

| Step | ID    | Action      | Speaker | Video Playing    | Audio Playing       |
| ---- | ----- | ----------- | ------- | ---------------- | ------------------- | ---------------------------------------------------- |
| 0    | s01-1 | SET_SPEAKER | ALEX    | —                | —                   |
| 1    | s01-1 | SET_SPEAKER | ALEX    | entering.mp4     | —                   | (this one is new, bot enters before any audio plays) |
| 2    | s01-2 | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-01 (immediate) |

---

## Slide 2: "Digital Twin"

| Step | ID    | Action      | Speaker | Video Playing    | Audio Playing       |
| ---- | ----- | ----------- | ------- | ---------------- | ------------------- |
| 0    | s02-1 | SET_SPEAKER | ALEX    | idle_loop.mp4    | —                   |
| 1    | s02-2 | REVEAL      | —       | idle_loop.mp4    | —                   |
| 2    | s02-3 | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-02 (immediate) |
| 3    | s02-4 | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-03 (immediate) |
| 4    | s02-5 | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-04 (immediate) |
| 5    | s02-6 | SET_SPEAKER | ALEX    | idle_loop.mp4    | —                   |
| 6    | s02-7 | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-05 (immediate) |

---

## Slide 3: "Engineers Show Up"

| Step | ID    | Action      | Speaker | Video Playing    | Audio Playing                      |
| ---- | ----- | ----------- | ------- | ---------------- | ---------------------------------- |
| 0    | s03-1 | SET_SPEAKER | ALEX    | idle_loop.mp4    | —                                  |
| 1    | s03-2 | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-06 (immediate, bot on screen) |
| 2    | s03-3 | SET_SPEAKER | ALEX    | idle_loop.mp4    | —                                  |
| 3    | s03-4 | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-07 (immediate)                |
| 4    | s03-5 | SET_SPEAKER | ALEX    | idle_loop.mp4    | —                                  |
| 5    | s03-6 | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-08 (immediate)                |

---

## Slide 4: "The Day AlexBot Died"

**Primary Speaker:** ALEX

| Step | ID       | Action      | Speaker | Video Playing | Audio Playing |
| ---- | -------- | ----------- | ------- | ------------- | ------------- |
| 0    | s04-1    | SET_SPEAKER | ALEX    | idle_loop.mp4 | —             |
| 1-4  | s04-2..5 | REVEAL      | —       | —             | —             |

---

## Slide 5: "We Gamified It"

**Primary Speaker:** ALEX

| Step | ID       | Action             | Speaker | Video Playing | Audio Playing |
| ---- | -------- | ------------------ | ------- | ------------- | ------------- |
| 0-3  | s05-1..4 | SET_SPEAKER/REVEAL | ALEX    | idle_loop.mp4 | —             |

---

## Slide 6: "Scoring"

**Primary Speaker:** BOT

| Step | ID    | Action      | Speaker | Video Playing    | Audio Playing       |
| ---- | ----- | ----------- | ------- | ---------------- | ------------------- |
| 0    | s06-1 | SET_SPEAKER | ALEX    | idle_loop.mp4    | —                   |
| 1    | s06-2 | PLAY_AUDIO  | BOT     | idle_loop.mp4    | clip-09 (immediate) |
| 2    | s06-3 | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-10 (immediate) |
| 3    | s06-4 | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-11 (immediate) |
| 4    | s06-5 | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-12 (immediate) |
| 5    | s06-6 | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-13 (immediate) |

---

## Slide 7: "What Failed"

**Primary Speaker:** BOT

| Step | ID    | Action      | Speaker | Video Playing    | Audio Playing       |
| ---- | ----- | ----------- | ------- | ---------------- | ------------------- |
| 0    | s07-1 | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-14 (immediate) |
| 1    | s07-2 | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-15 (immediate) |
| 2    | s07-3 | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-16 (immediate) |
| 3    | s07-4 | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-17 (immediate) |
| 4    | s07-5 | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-18 (immediate) |
| 5    | s07-6 | SET_SPEAKER | ALEX    | idle_loop.mp4    | —                   |

---

## Slide 8: "What Worked"

**Primary Speaker:** ALEX

| Step | ID       | Action      | Speaker | Video Playing | Audio Playing |
| ---- | -------- | ----------- | ------- | ------------- | ------------- |
| 0    | s08-1    | SET_SPEAKER | ALEX    | idle_loop.mp4 | —             |
| 1-7  | s08-2..8 | REVEAL      | —       | idle_loop.mp4 | —             |

---

## Slide 9: "Paradox"

**Primary Speaker:** BOTH

| Step | ID       | Action      | Speaker | Video Playing    | Audio Playing       |
| ---- | -------- | ----------- | ------- | ---------------- | ------------------- |
| 0    | s09-1    | SET_SPEAKER | ALEX    | idle_loop.mp4    | —                   |
| 1-3  | s09-2..4 | REVEAL      | —       | idle_loop.mp4    | —                   |
| 4    | s09-5    | REVEAL      | —       | idle_loop.mp4    | —                   |
| 5    | s09-6    | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-19 (immediate) |
| 6    | s09-7    | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-20 (immediate) |

---

## Slide 10: "Excellent But No"

**Primary Speaker:** BOT

| Step | ID    | Action      | Speaker | Video Playing    | Audio Playing       |
| ---- | ----- | ----------- | ------- | ---------------- | ------------------- |
| 0    | s10-1 | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-21 (immediate) |
| 1    | s10-2 | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-22 (immediate) |
| 2    | s10-3 | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-23 (immediate) |
| 3    | s10-4 | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-24 (immediate) |
| 4    | s10-5 | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-25 (immediate) |
| 5    | s10-6 | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-26 (immediate) |
| 6    | s10-7 | SET_SPEAKER | ALEX    | idle_loop.mp4    | —                   |
| 7    | s10-8 | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-27 (immediate) |

---

## Slide 11: "I Die Every Conversation"

**Primary Speaker:** BOT

| Step | ID        | Action      | Speaker | Video Playing    | Audio Playing           |
| ---- | --------- | ----------- | ------- | ---------------- | ----------------------- |
| 0    | s11-1     | SET_SPEAKER | ALEX    | idle_loop.mp4    | —                       |
| 1    | s11-2     | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-28 (immediate)     |
| 2-10 | s11-3..11 | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clips 29-37 (immediate) |
| 11   | s11-12    | SET_SPEAKER | ALEX    | idle_loop.mp4    | —                       |

---

## Slide 12: "Teachers"

**Primary Speaker:** BOTH

| Step | ID    | Action      | Speaker | Video Playing    | Audio Playing       |
| ---- | ----- | ----------- | ------- | ---------------- | ------------------- |
| 0    | s12-1 | SET_SPEAKER | ALEX    | idle_loop.mp4    | —                   |
| 1    | s12-2 | REVEAL      | —       | idle_loop.mp4    | —                   |
| 2    | s12-3 | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-38 (immediate) |
| 3    | s12-4 | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-39 (immediate) |
| 4    | s12-5 | SET_SPEAKER | ALEX    | idle_loop.mp4    | —                   |

---

## Slide 13: "Architecture"

**Primary Speaker:** BOT

| Step | ID       | Action      | Speaker | Video Playing    | Audio Playing           |
| ---- | -------- | ----------- | ------- | ---------------- | ----------------------- |
| 0    | s13-1    | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-40 (immediate)     |
| 1-4  | s13-2..5 | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clips 41-44 (immediate) |
| 5    | s13-6    | SET_SPEAKER | ALEX    | idle_loop.mp4    | —                       |

---

## Slide 14: "What's Next"

**Primary Speaker:** ALEX

| Step | ID    | Action      | Speaker | Video Playing | Audio Playing |
| ---- | ----- | ----------- | ------- | ------------- | ------------- |
| 0    | s14-1 | SET_SPEAKER | ALEX    | idle_loop.mp4 | —             |
| 1    | s14-2 | REVEAL      | —       | idle_loop.mp4 | —             |

---

## Slide 15: "One Last Thing"

**Primary Speaker:** BOTH

| Step | ID     | Action      | Speaker | Video Playing    | Audio Playing       |
| ---- | ------ | ----------- | ------- | ---------------- | ------------------- |
| 0    | s15-1  | SET_SPEAKER | ALEX    | idle_loop.mp4    | —                   |
| 1    | s15-2  | REVEAL      | —       | idle_loop.mp4    | —                   |
| 2    | s15-3  | SET_SPEAKER | ALEX    | idle_loop.mp4    | —                   |
| 3    | s15-4  | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-45 (deferred)  |
| 4    | s15-5  | SET_SPEAKER | ALEX    | idle_loop.mp4    | —                   |
| 5    | s15-6  | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-46 (immediate) |
| 6    | s15-7  | REVEAL      | —       | idle_loop.mp4    | —                   |
| 7    | s15-8  | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-47 (immediate) |
| 8    | s15-9  | REVEAL      | —       | idle_loop.mp4    | —                   |
| 9    | s15-10 | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-48 (immediate) |
| 10   | s15-11 | SET_SPEAKER | ALEX    | idle_loop.mp4    | —                   |
| 11   | s15-12 | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-49 (immediate) |
| 12   | s15-13 | PLAY_AUDIO  | BOT     | talking_loop.mp4 | clip-50 (immediate) |
