import type { CommandOrigin } from "./command.js";
export interface WorkspaceTransaction<T> { readonly id: string; readonly origin: CommandOrigin; readonly description: string; readonly before: T; readonly after: T; readonly createdAt: number; readonly groupKey?: string }
