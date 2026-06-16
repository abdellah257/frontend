import { Component, OnDestroy, OnInit } from "@angular/core";
import { BehaviorSubject, Subscription } from "rxjs";
import { TableField } from "shared/modules/dynamic-material-table/models/table-field.model";
import {
  ITableSetting,
  TableSettingEventType,
} from "shared/modules/dynamic-material-table/models/table-setting.model";
import {
  TablePagination,
  TablePaginationMode,
} from "shared/modules/dynamic-material-table/models/table-pagination.model";
import {
  IRowEvent,
  ITableEvent,
  TableEventType,
  RowEventType,
  TableSelectionMode,
} from "shared/modules/dynamic-material-table/models/table-row.model";
import { Store } from "@ngrx/store";
import { ActivatedRoute, Router } from "@angular/router";
import { updateUserSettingsAction } from "state-management/actions/user.actions";
import { Sort } from "@angular/material/sort";
import { selectDatafilesWithCountAndTableSettings } from "state-management/selectors/files.selectors";
import { fetchDatasetOrigDatablocksAction } from "state-management/actions/files.actions";
import { get } from "lodash-es";
import { DatePipe } from "@angular/common";
import { actionMenu } from "shared/modules/dynamic-material-table/utilizes/default-table-settings";
import { TableConfigService } from "shared/services/table-config.service";
import { FileSizePipe } from "shared/pipes/filesize.pipe";
import { TimeDurationPipe } from "shared/pipes/time-duration.pipe";
import { MatDialog } from "@angular/material/dialog";
import { AppConfigService } from "app-config.service";
import { DataFiles_File } from "../datafiles.interfaces";
import {
  ActionItemDataset,
  ActionItems,
} from "shared/modules/configurable-actions/configurable-action.interfaces";
import { selectCurrentDataset } from "state-management/selectors/datasets.selectors";
import { HDF5ViewerComponent } from "../hdf5viewer/hdf5viewer.component";

@Component({
  selector: "dynamic-datafiles",
  templateUrl: "./dynamic-datafiles.component.html",
  styleUrls: ["./dynamic-datafiles.component.scss"],
  standalone: false,
})
export class DynamicDatafilesComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  appConfig = this.appConfigService.getConfig();

  tableName = "datafilesTable";
  columns: TableField<any>[];
  pending = true;
  setting: ITableSetting = {};
  paginationMode: TablePaginationMode = "server-side";
  dataSource: BehaviorSubject<object[]> = new BehaviorSubject<object[]>([]);
  pagination: TablePagination = {};
  rowSelectionMode: TableSelectionMode = "multi";

  tooLargeFile = false;
  totalFileSize = 0;
  selectedFileSize = 0;

  areAllSelected = false;
  isNoneSelected = true;

  files: Array<DataFiles_File> = [];
  dataset$ = this.store.select(selectCurrentDataset);
  datasetId = undefined;
  actionItems: ActionItems = {
    datasets: [],
  };

  globalTextSearch = "";
  defaultPageSize = 10;
  defaultPageSizeOptions = [5, 10, 25, 100];
  tableDefaultSettingsConfig: ITableSetting = {
    visibleActionMenu: actionMenu,
    settingList: [
      {
        visibleActionMenu: actionMenu,
        isDefaultSetting: true,
        isCurrentSetting: true,
        columnSetting: [
          {
            name: "dataFileList.path",
            icon: "text_snippet",
            header: "Filename",
            customRender(column, row) {
              return get(row, column.name);
            },
          },
          {
            name: "dataFileList.size",
            icon: "save",
            header: "Size",
            customRender(column, row) {
              return get(row, column.name, 0);
            },
          },
          {
            name: "dataFileList.metadata.measurement_type",
            icon: "person",
            header: "Measurement type",
            customRender: (column, row) => {
              return get(row, column.name, "-");
            },
          },
          {
            name: "dataFileList.metadata.sample_type",
            icon: "person",
            header: "Sample type",
            customRender: (column, row) => {
              return get(row, column.name, "-");
            },
          },
          {
            name: "dataFileList.metadata.measurement_subtype",
            icon: "person",
            header: "Measurement Subtype",
            customRender: (column, row) => {
              return get(row, column.name, "-");
            },
          },
          {
            name: "dataFileList.metadata.duration",
            icon: "access_time",
            header: "Duration",
            customRender: (column, row) => {
              return this.timeDurationPipe.transform(get(row, column.name, 0));
            },
          },
          {
            name: "dataFileList.time",
            icon: "access_time",
            header: "Created at",
            customRender: (column, row) => {
              return this.datePipe.transform(get(row, column.name));
            },
          },
        ],
      },
    ],
    rowStyle: {
      "border-bottom": "1px solid #d2d2d2",
    },
  };

  count = 0;
  pageSize = 25;
  currentPage = 0;
  fileDownloadEnabled: boolean = this.appConfig.fileDownloadEnabled;
  multipleDownloadEnabled: boolean = this.appConfig.multipleDownloadEnabled;
  fileserverBaseURL: string | undefined = this.appConfig.fileserverBaseURL;
  fileserverButtonLabel: string =
    this.appConfig.fileserverButtonLabel || "Download";
  multipleDownloadAction: string | null = this.appConfig.multipleDownloadAction;
  maxFileSize: number | null = this.appConfig.maxDirectDownloadSize;
  sourceFolder: string =
    this.appConfig.sourceFolder || "No source folder provided";
  sftpHost: string = this.appConfig.sftpHost || "No sftp host provided";
  maxFileSizeWarning: string | null =
    this.appConfig.maxFileSizeWarning ||
    `Some files are above the max size ${this.fileSizePipe.transform(this.maxFileSize)}`;

  constructor(
    public appConfigService: AppConfigService,
    private store: Store,
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private fileSizePipe: FileSizePipe,
    private timeDurationPipe: TimeDurationPipe,
    private tableConfigService: TableConfigService,
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.dataset$.subscribe((dataset) => {
        if (dataset) {
          this.actionItems.datasets = <ActionItemDataset[]>[dataset];
          this.datasetId = dataset.pid;
          this.sourceFolder = dataset.sourceFolder;
        }
      }),
    );
    this.subscriptions.push(
      this.store
        .select(selectDatafilesWithCountAndTableSettings)
        .subscribe(({ origDatablocks, count, tablesSettings }) => {
          this.dataSource.next(origDatablocks);
          this.pending = false;
          this.count = count;

          const savedTableConfigColumns = tablesSettings?.columns;
          const tableSort = this.getTableSort();
          const paginationConfig = this.getTablePaginationConfig(count);

          const tableSettingsConfig =
            this.tableConfigService.getTableSettingsConfig(
              this.tableName,
              this.tableDefaultSettingsConfig,
              savedTableConfigColumns,
              tableSort,
            );

          if (tableSettingsConfig?.settingList.length) {
            this.initTable(tableSettingsConfig, paginationConfig);
          }
        }),
    );

    this.subscriptions.push(
      this.route.queryParams.subscribe((queryParams) => {
        this.pending = true;
        const limit = queryParams.pageSize
          ? +queryParams.pageSize
          : this.defaultPageSize;
        const skip = queryParams.pageIndex ? +queryParams.pageIndex * limit : 0;
        if (queryParams.textSearch) {
          this.globalTextSearch = queryParams.textSearch;
        }
        if (this.datasetId) {
          this.store.dispatch(
            fetchDatasetOrigDatablocksAction({
              limit: limit,
              skip: skip,
              search: queryParams.textSearch,
              sortColumn: queryParams.sortColumn,
              sortDirection: queryParams.sortDirection,
              datasetId: this.datasetId,
            }),
          );
        }
      }),
    );
  }

  getTableSort(): ITableSetting["tableSort"] {
    const { queryParams } = this.route.snapshot;

    if (queryParams.sortDirection && queryParams.sortColumn) {
      return {
        sortColumn: queryParams.sortColumn,
        sortDirection: queryParams.sortDirection,
      };
    }

    return null;
  }

  getTablePaginationConfig(dataCount = 0): TablePagination {
    const { queryParams } = this.route.snapshot;

    return {
      pageSizeOptions: this.defaultPageSizeOptions,
      pageIndex: queryParams.pageIndex,
      pageSize: queryParams.pageSize || this.defaultPageSize,
      length: dataCount,
    };
  }

  initTable(
    settingConfig: ITableSetting,
    paginationConfig: TablePagination,
  ): void {
    const currentColumnSetting = settingConfig.settingList.find(
      (s) => s.isCurrentSetting,
    )?.columnSetting;

    this.columns = currentColumnSetting;
    this.setting = settingConfig;
    this.pagination = paginationConfig;
  }

  onPaginationChange(pagination: TablePagination) {
    this.router.navigate([], {
      queryParams: {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
      queryParamsHandling: "merge",
    });
  }

  onGlobalTextSearchChange(text: string) {
    this.router.navigate([], {
      queryParams: {
        textSearch: text || undefined,
        pageIndex: 0,
      },
      queryParamsHandling: "merge",
    });
  }

  saveTableSettings(setting: ITableSetting) {
    this.pending = true;
    const columnsSetting = setting.columnSetting.map((column, index) => {
      const { name, display, width } = column;

      return { name, display, order: index, width };
    });

    this.store.dispatch(
      updateUserSettingsAction({
        property: {
          fe_datafiles_table_columns: columnsSetting,
        },
      }),
    );
  }

  onSettingChange(event: {
    type: TableSettingEventType;
    setting: ITableSetting;
  }) {
    if (
      event.type === TableSettingEventType.save ||
      event.type === TableSettingEventType.create
    ) {
      this.saveTableSettings(event.setting);
    }
  }

  onRowClick(event: IRowEvent<object>) {
    if (event.event === RowEventType.RowClick) {
      const filePath: string =
        get(event.sender.row, "dataFileList.path") ||
        get(event.sender.row, "dataFileList.0.path") ||
        get(event.sender.row, "path");

      if (typeof filePath === "string" && filePath.length) {
        const url = this.buildFileUrl(filePath);
        this.openHDF5Viewer("https://data.ill.fr/myhdf5/view", url);
      }
    }
  }

  buildFileUrl(filePath: string): string {
    const sourceFolder = this.sourceFolder.replace(/\/+$/, "");
    const normalizedFilePath = filePath.replace(/^\/+/, "");

    return `${sourceFolder}/${normalizedFilePath}`;
  }

  openHDF5Viewer(serviceUrl: string, fileUrl: string): void {
    this.dialog.open(HDF5ViewerComponent, {
      width: "90vw",
      height: "90vh",
      data: { baseUrl: serviceUrl, fileUrl: fileUrl },
      panelClass: "hdf5-viewer",
    });
  }

  onTableEvent({ event, sender }: ITableEvent) {
    if (event === TableEventType.SortChanged) {
      const { active: sortColumn, direction: sortDirection } = sender as Sort;
      this.router.navigate([], {
        queryParams: {
          pageIndex: 0,
          sortDirection: sortDirection || undefined,
          sortColumn: sortDirection ? sortColumn : undefined,
        },
        queryParamsHandling: "merge",
      });
    }
  }

  hasTooLargeFiles(files: any[]) {
    if (this.maxFileSize) {
      const maxFileSize = this.maxFileSize;
      const largeFiles = files.filter((file) => file.size > maxFileSize);
      if (largeFiles.length > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  hasFileAboveMaxSizeWarning() {
    /**
     * Template for a file size warning message.
     * Placeholders:
     * - <maxDirectDownloadSize>: Maximum file size allowed (e.g., "10 MB").
     * - <sftpHost>: SFTP host for downloading large files.
     * - <sourceFolder>: Directory path on the SFTP host.
     *
     * Example usage:
     * Some files are above <maxDirectDownloadSize>. These file can be accessed via sftp host: <sftpHost> in directory: <sourceFolder>
     */

    const valueMapping = {
      sftpHost: this.sftpHost,
      sourceFolder: this.sourceFolder,
      maxDirectDownloadSize: this.fileSizePipe.transform(this.maxFileSize),
    };

    let warning = this.maxFileSizeWarning;

    Object.keys(valueMapping).forEach((key) => {
      warning = warning.replace(
        "<" + key + ">",
        `<strong>${valueMapping[key]}</strong>`,
      );
    });

    return warning;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }
}
