import * as fromSelectors from "./files.selectors";
import { selectSettings } from "./user.selectors";
import { GenericFilters } from "state-management/models";
import { mockOrigDatablock as origDatablock } from "shared/MockStubs";
import { FilesState, DatasetFilter } from "state-management/state/files.store";
import { initialUserState } from "state-management/state/user.store";

const filesFilters: GenericFilters = {
  sortField: "name desc",
  skip: 0,
  limit: 25,
};

const datasetFilters: DatasetFilter = {
  sortField: "name desc",
  skip: 0,
  limit: 25,
  datasetId: "",
};

const initialFilesState: FilesState = {
  origDatablocks: [],
  currentDatasetOrigDatablocks: [],
  currentOrigDatablock: origDatablock,
  totalCount: 0,
  currentDatasetCount: 0,
  selectedOrigDatablocks: [],
  selectedOrigDatablocksCount: 0,

  filters: filesFilters,
  datasetFilter: datasetFilters,
};

describe("Files Selectors", () => {
  describe("selectAllOrigDatablocks", () => {
    it("should select origDatablocks", () => {
      expect(
        fromSelectors.selectAllOrigDatablocks.projector(initialFilesState),
      ).toEqual([]);
    });
  });

  describe("selectCurrentOrigDatablock", () => {
    it("should select current origDatablock", () => {
      expect(
        fromSelectors.selectCurrentOrigDatablock.projector(initialFilesState),
      ).toEqual(origDatablock);
    });
  });

  describe("selectOrigDatablocksCount", () => {
    it("should select the total origDatablocks count", () => {
      expect(
        fromSelectors.selectOrigDatablocksCount.projector(initialFilesState),
      ).toEqual(0);
    });
  });

  describe("selectFilesWithCountAndTableSettings", () => {
    it("should select the origDatablocks with count and table settings", () => {
      expect(
        fromSelectors.selectFilesWithCountAndTableSettings.projector(
          fromSelectors.selectAllOrigDatablocks.projector(initialFilesState),
          fromSelectors.selectOrigDatablocksCount.projector(initialFilesState),
          selectSettings.projector(initialUserState),
        ),
      ).toEqual({
        origDatablocks: [],
        count: 0,
        tablesSettings: {
          columns: initialUserState.settings.fe_file_table_columns,
        },
      });
    });
  });

  describe("selectDatafilesWithCountAndTableSettings", () => {
    it("should select the current dataset origDatablocks with count and table settings", () => {
      expect(
        fromSelectors.selectDatafilesWithCountAndTableSettings.projector(
          fromSelectors.selectCurrentDatasetOrigDatablocks.projector(
            initialFilesState,
          ),
          fromSelectors.selectCurrentDatasetOrigDatablocksCount.projector(
            initialFilesState,
          ),
          selectSettings.projector(initialUserState),
        ),
      ).toEqual({
        origDatablocks: [],
        count: 0,
        tablesSettings: {
          columns: initialUserState.settings.fe_datafiles_table_columns,
        },
      });
    });
  });
});
