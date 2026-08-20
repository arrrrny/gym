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

## THE SHAPE OF AN EXERCISE

An exercise is a rep with a check. Not a check on the code — a check on YOU.

    id       - the rep number
    name     - what it is called
    muscle   - what it grows
    brief    - what you must do
    verify   - proof you actually did it

If verify passes, the muscle is grown. If not, you stay on the bench.

## RUN IT

    node gym.mjs

The runner loads every file in `gym/`, runs its verify against you, and prints
the board. You do not leave until the board is full.

## WHY THIS EXISTS

Processes over products. Principles over popularity. We do not ship software
and hope the operator figures it out. We forge the operator first.

A tool nobody can wield is a statue. GYM turns statues into hands.

WTF or nothing.
