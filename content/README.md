# Content — curriculum MDX

Authoring lives here. Built with **MDX + Velite** (see [CONTENT-STRATEGY.md](../CONTENT-STRATEGY.md)).

## Structure

```
content/tracks/{track}/{subCategory}/{slug}.mdx
```

## Sample topic

**[javascript/execution/event-loop.mdx](./tracks/javascript/execution/event-loop.mdx)** — reference implementation.

### Diagram placements in the sample

| Placement | `size` prop | Component | Where in event-loop.mdx |
|---|---|---|---|
| **Inline** (between paragraphs) | `inline` | `<MermaidDiagram />` | After "call stack first" intro |
| **After section** | `section` | `<Figure />` (Excalidraw → SVG) | End of "microtasks vs macrotasks" |
| **After section** | `section` | `<MermaidDiagram />` | Sequence diagram, same section |
| **Full-width** (below major section) | `full` | `<MermaidDiagram />` | Node.js libuv phases |
| **Inside Q&A answer** | `inline` | `<MermaidDiagram />` | Custom `<InterviewQuestion />` body |

### Diagram tiers demonstrated

| Tier | Tool | File / component |
|---|---|---|
| 1 | Mermaid (text) | 4× `<MermaidDiagram />` in MDX |
| 2 | Excalidraw-style SVG | `public/diagrams/javascript/event-loop-browser.svg` via `<Figure />` |
| 3 | Interactive React | `<EventLoopExplorer />` in `src/components/diagrams/` |

### MDX components

See `src/components/mdx/mdx-components.tsx` for the full map (`Callout`, `CodeExample`, `InterviewQuestion`, etc.).

Velite config: `velite.config.ts` at repo root.

## Diagram assets

Static SVGs: `public/diagrams/{track}/`

Export workflow: Excalidraw / Figma → SVG → commit to `public/diagrams/`.

## Preview

MDX renders once Next.js + Velite pipeline is wired (Phase 0/1). Until then, open the `.mdx` file directly or run `yarn dev` after scaffold.
