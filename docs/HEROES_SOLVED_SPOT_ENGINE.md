# HEROES Solved Spot Engine v1

**1 counted spot = 1 validated solver decision for 1 concrete scenario + 1 hand.**

Installed bank:
- PRE-FLOP: 5,000
- FLOP: 3,000
- TURN: 3,000
- RIVER: 3,000
- TOTAL: 14,000

Pre-flop distribution:
- RFI: 700
- vs RFI: 700
- 3-bet / 4-bet wars: 900
- blind war / heads-up: 500
- squeeze / limp / isolation: 500
- shove / call-shove / reshove: 900
- ICM / PKO pressure: 500
- multiway all-in: 300

Post-flop distribution:
- FLOP: 1,800 general HU + 1,200 texture/sizing
- TURN: 3,000 general solver decisions
- RIVER: 2,500 general HU + 500 multiway

The runtime samples without replacement and persists viewed decision IDs in localStorage. No decision repeats until the finite 14,000-decision cycle is exhausted.

Production provenance is the existing Grinder EVO solved-spot pipeline. The primary production solver is DCFR-SOLVER by exinori (MIT). TexasSolver/GTOpen adapter identifiers are not counted as production provenance unless actual configured solves exist.
