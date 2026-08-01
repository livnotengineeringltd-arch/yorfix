# Graph Report - C:\Users\samki\Desktop\Cowork OS\06 Cleaning\yorfix  (2026-08-01)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 23 nodes · 33 edges · 5 communities (3 shown, 2 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4

## God Nodes (most connected - your core abstractions)
1. `renderTable()` - 6 edges
2. `loadAll()` - 5 edges
3. `tryLogin()` - 4 edges
4. `rpc()` - 3 edges
5. `esc()` - 3 edges
6. `statusSelect()` - 3 edges
7. `nextHero()` - 3 edges
8. `fmtDate()` - 2 edges
9. `renderStats()` - 2 edges
10. `switchTab()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `loadAll()` --calls--> `renderTable()`  [EXTRACTED]
  js/admin.js → js/admin.js  _Bridges community 2 → community 0_

## Import Cycles
- None detected.

## Communities (5 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.52
Nodes (5): esc(), fmtDate(), renderTable(), statusSelect(), switchTab()

### Community 1 - "Community 1"
Cohesion: 0.43
Nodes (5): goHero(), goReview(), nextHero(), restartHeroTimer(), restartRevTimer()

### Community 2 - "Community 2"
Cohesion: 0.50
Nodes (5): loadAll(), renderStats(), rpc(), showDashboard(), tryLogin()

## Knowledge Gaps
- **2 isolated node(s):** `YorFixAPI`, `YORFIX_CONFIG`
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `renderTable()` connect `Community 0` to `Community 2`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `loadAll()` connect `Community 2` to `Community 0`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `tryLogin()` connect `Community 2` to `Community 0`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `YorFixAPI`, `YORFIX_CONFIG` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._