# API Enhancement Plan & Todo List

This document outlines the strategy for improving the `apps/api` IPTV backend. The goals are to enhance performance, reliability, and maintainability.

## Architectural Goals
- **Unified Service Layer**: Move all business logic from tRPC routers to the `services/` directory.
- **Type Safety**: Use precise Zod schemas for all inputs and outputs.
- **Scalability**: Implement pagination and server-side search for large datasets.
- **Data Integrity**: Use UPSERTs and transactions for atomic updates.

---

## 📋 Todo List

### Phase 1: Foundation & Type Enhancements
- [x] **Enhance Input/Output Types**: Refine Zod schemas in `packages/trpc/src/server/schema.ts` and apply them to all routes.
- [x] **Router Refactoring**: Move logic from `channelsRouter`, `moviesRouter`, and `seriesRouter` into their respective services for core listing procedures.
- [ ] **Centralized Xtream Client**: Ensure all services use a consistent client factory with built-in retry logic.

### Phase 2: Performance & Scalability
- [/] **Pagination**: Added cursor-based pagination to `getChannels`, `getMovies`, and `getseries` queries.
- [ ] **Server-Side Search**: Implement a search procedure in tRPC that queries the database directly.
- [ ] **Caching Layer**: Implement a simple in-memory or Redis-based cache for slow EPG and Category requests.

### Phase 3: Data Integrity & Resilience
- [ ] **Atomic Synchronization**: Replace the "Delete & Insert" pattern with "UPSERT" (`onConflictUpdate`) in `channelService.ts`.
- [ ] **Database Transactions**: Wrap multi-step sync processes (Categories + Items) in `db.transaction`.
- [ ] **API Retries**: Implement exponential backoff for all `@iptv/xtream-api` calls.

### Phase 4: Completing Missing Features
- [ ] **Playlist Auto-Sync**: Complete the `updatePlaylists` procedure logic to keep data fresh.
- [ ] **Health Checks**: Expand `/api/health` to monitor DB and external API availability.

---

## 🛠️ Detailed Implementation Plan

### 1. Type Enhancements
Currently, some routes use broad types or `z.any()`. We will:
- Define `PaginatedResponse<T>` schema.
- Ensure `zodChannelsSchema` and others strictly match the DB schema and client expectations.
- Use `.optional()` and `.nullable()` precisely to avoid runtime errors on the client.

### 2. UPSERT Strategy
Instead of:
```typescript
await db.delete(channels).where(...);
await insertChannels(newChannels);
```
We will use:
```typescript
await db.insert(channels)
  .values(newChannels)
  .onConflictDoUpdate({
    target: [channels.streamId, channels.categoryId, channels.playlistId],
    set: { name: sql`excluded.name`, url: sql`excluded.url`, ... }
  });
```

### 3. Pagination & Search
Large playlists (>10k channels) currently crash or slow down the client.
- **Input**: `z.object({ ..., cursor: z.number().nullish(), limit: z.number().min(1).max(100).default(50) })`
- **Output**: `z.object({ items: z.array(...), nextCursor: z.number().nullish() })`

### 4. Background Sync
Use the `updatedAt` field in `playlists` to trigger periodic refreshes without blocking the user interface.
