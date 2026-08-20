# GYM
## GROW YOUR MUSCLES

Software ships with a `test/` folder. You run the tests. They prove the
software works.

That is fine. That is weak.

GYM is the other folder. It does not prove the software works. It proves
***YOU*** can wield it.

A test exercises the code. A GYM exercises the operator.

Every rep you do in a GYM grows a muscle: the reflex, the instinct, the
second-nature grip on the tool. By the time you walk out, the software is no
longer foreign. It is part of your body.

This is the interaction face of software. The place where a user or an agent
does reps until the tool is meat on their bones.

## TESTS vs GYM

- TESTS ask: does the code do the right thing?
- GYM asks: can YOU do the right thing with it?
- Tests are read by CI. GYM is run by the operator.
- A green test means the software shipped. A finished GYM means YOU shipped.

## MANDATORY TUTORIALS, BUT REAL

You know a game that forces you through a tutorial before it lets you play?
That tutorial is a GYM. It is not there to test the game. It is there to grow
the player until the controls are reflex.

GYM is that, for every piece of software.

Before an agent is allowed to drive miki and control kimi, it completes the
miki GYM. No shortcuts. Grow first, then operate.

## TWO PHASES

A GYM is not one thing. It is a pipeline that forges the operator before they
touch the real work.

PHASE 1 — WARMUP. Reps that grow the reflexes to use the software. You do them
under the runner's eye. Finish the board or stay on the bench.

PHASE 2 — EXERCISES. Real tasks. The runner hands you a brief and walks off.
You build it by yourself, with the tools, in your own workspace. No hand
holding. When you are done you submit. Then the machine grades you.

## EVALUATION

When you submit, automated tests run against what you built. Not against the
software — against YOUR work. The tests decide if the muscle is real or fake.

This is the inverse of a test suite. A test suite protects the code from you.
GYM tests protect the real task from an operator who is not ready.

## THE GATE

Pass the exercises and the gate opens. You are cleared to do the actual task.

Fail and you are out. No negotiation. The real work only gets operators who
proved they can wield the tool.

Warmup grows the muscle. Exercises prove it under load. The gate only lets the
proven through.

## THE SHAPE OF A REP (WARMUP)

A rep is aCheck with a check. Not a check on the code — a check on YOU.

    id       - the rep number
    name     - what it is called
    muscle   - what it grows
    brief    - what you must do
    verify   - proof you actually did it

If verify passes, the muscle is grown. If not, you stay on the bench.

## THE SHAPE OF AN EXERCISE (GRADED)

An exercise is a brief plus an evaluator. The evaluator is the automated test
that grades your submission.

    id        - the exercise number
    name      - what it is called
    muscle    - what it proves under load
    brief     - what to build, and the rules
    evaluate  - (workspace) => { pass, notes }  runs against what you left

You submit by leaving a `.submitted` marker in your workspace. The runner then
runs evaluate() on that workspace. Pass all exercises and the gate opens.

## RUN IT

    node gym.mjs                      runs warmup reps + graded exercises
    GYM_EXERCISES=skip node gym.mjs  warmup only
    GYM_TIMEOUT=20 node gym.mjs      cap the exercise wait at 20s

PHASE 1 loads every `verify`-bearing file in `gym/` and grows the muscle or
sends you back to the bench. PHASE 2 loads every `evaluate`-bearing file in
`exercises/`, hands you the brief and the `gym/.sandbox/`, and waits for your
`.submitted` marker. When it appears, the runner grades your work. Board full
and exercises passed — the gate opens.

## WHY THIS EXISTS

Processes over products. Principles over popularity. We do not ship software
and hope the operator figures it out. We forge the operator first.

A tool nobody can wield is a statue. GYM turns statues into hands.

WTF or nothing.
