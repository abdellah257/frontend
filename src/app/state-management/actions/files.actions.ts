import { createAction, props } from "@ngrx/store";
import { OrigDatablock } from "@scicatproject/scicat-sdk-ts-angular";

export const fetchAllOrigDatablocksAction = createAction(
  "[OrigDatablock] Fetch All Orig Datablocks",
  props<{
    skip?: number;
    limit?: number;
    search?: string;
    sortDirection?: string;
    sortColumn?: string;
  }>(),
);
export const fetchAllOrigDatablocksCompleteAction = createAction(
  "[OrigDatablock] Fetch All Orig Datablocks Complete",
  props<{ origDatablocks: object[] }>(),
);
export const fetchAllOrigDatablocksFailedAction = createAction(
  "[OrigDatablock] Fetch All Orig Datablocks Failed",
);

export const fetchCountAction = createAction(
  "[OrigDatablock] Fetch Count",
  props<{ fields?: Record<string, unknown> }>(),
);
export const fetchCountCompleteAction = createAction(
  "[OrigDatablock] Fetch Count Complete",
  props<{ count: number; fields?: Record<string, unknown> }>(),
);
export const fetchCountFailedAction = createAction(
  "[OrigDatablock] Fetch Count Failed",
);

// Dataset Dynamic DataFiles actions
export const fetchDatasetOrigDatablocksAction = createAction(
  "[OrigDatablock] Fetch All Orig Datablocks",
  props<{
    datasetId?: string;
    skip?: number;
    limit?: number;
    search?: string;
    sortDirection?: string;
    sortColumn?: string;
  }>(),
);
export const fetchDatasetOrigDatablocksCompleteAction = createAction(
  "[OrigDatablock] Fetch Dataset Orig Datablocks Complete",
  props<{ currentDatasetOrigDatablocks: object[] }>(),
);
export const fetchDatasetOrigDatablocksFailedAction = createAction(
  "[OrigDatablock] Fetch All Orig Datablocks Failed",
);

// DataFiles Table selection
export const selectOrigDatablockAction = createAction(
  "[OrigDatablock] Select Orig Datablock",
  props<{ selectedOrigDatablocks: object[] }>(),
);
export const deselectOrigDatablockAction = createAction(
  "[OrigDatablock] Deselect Orig Datablock",
  props<{ selectedOrigDatablocks: object[] }>(),
);
export const selectAllOrigDatablocksAction = createAction(
  "[OrigDatablock] Select All Orig Datablocks",
);
export const clearSelectionAction = createAction(
  "[OrigDatablock] Clear Selection",
);

export const fetchOrigDatablockAction = createAction(
  "[OrigDatablock] Fetch Orig Datablock",
  props<{ id: string }>(),
);
export const fetchOrigDatablockCompleteAction = createAction(
  "[OrigDatablock] Fetch Orig Datablock Complete",
  props<{ origDatablock: OrigDatablock }>(),
);
export const fetchOrigDatablockFailedAction = createAction(
  "[OrigDatablock] Fetch Orig Datablock Failed",
);

export const clearOrigDatablockStateAction = createAction(
  "[OrigDatablock] Clear State",
);
