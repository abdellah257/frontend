import { GenericFilters } from "state-management/models";

export interface DatasetFilter {
  datasetId: string;
  skip: number;
  limit: number;
  sortField: string;
}

export interface FilesState {
  origDatablocks: object[];
  currentOrigDatablock: object | undefined;
  currentDatasetOrigDatablocks: object[];

  selectedOrigDatablocks: object[];

  totalCount: number;
  currentDatasetCount: number;
  selectedOrigDatablocksCount: number;

  filters: GenericFilters;

  datasetFilter: DatasetFilter;
}

export const initialFilesState: FilesState = {
  origDatablocks: [],
  currentOrigDatablock: undefined,
  currentDatasetOrigDatablocks: [],
  selectedOrigDatablocks: [],

  totalCount: 0,
  currentDatasetCount: 0,
  selectedOrigDatablocksCount: 0,

  filters: {
    sortField: "createdAt desc",
    skip: 0,
    limit: 25,
  },

  datasetFilter: {
    datasetId: "",
    skip: 0,
    limit: 25,
    sortField: "createdAt desc",
  },
};
