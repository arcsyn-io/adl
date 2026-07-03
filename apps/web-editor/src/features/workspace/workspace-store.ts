import { create } from "zustand";
import type { WorkspaceController, WorkspaceSnapshot } from "./workspace-controller.js";

export const createWorkspaceStore = (controller: WorkspaceController) => { const store=create<{ snapshot: WorkspaceSnapshot }>(() => ({ snapshot: controller.getSnapshot() }));controller.subscribe(snapshot=>store.setState({snapshot}));return store; };
export const connectWorkspaceStore = (controller: WorkspaceController, set: (value: { snapshot: WorkspaceSnapshot }) => void): (() => void) => controller.subscribe(snapshot => set({ snapshot }));
