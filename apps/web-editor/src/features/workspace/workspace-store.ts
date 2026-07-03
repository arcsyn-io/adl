import { create } from "zustand";
import type { WorkspaceController, WorkspaceSnapshot } from "./workspace-controller.js";

export const createWorkspaceStore = (controller: WorkspaceController) => create<{ snapshot: WorkspaceSnapshot }>(() => ({ snapshot: controller.getSnapshot() }));
export const connectWorkspaceStore = (controller: WorkspaceController, set: (value: { snapshot: WorkspaceSnapshot }) => void): (() => void) => controller.subscribe(snapshot => set({ snapshot }));
