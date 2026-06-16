import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

export interface HDF5ViewerData {
  baseUrl: string;
  fileUrl: string;
}

@Component({
  selector: "app-hdf5-viewer",
  templateUrl: "./hdf5viewer.component.html",
  styleUrls: ["./hdf5viewer.component.scss"],
  standalone: false,
})
export class HDF5ViewerComponent implements OnInit {
  trustedUrl: SafeResourceUrl;
  loading = true;
  originalUrl: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: HDF5ViewerData,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.loading = true;

    const fileUrl = new URL("https://data.ill.fr/proposal/getfile");
    fileUrl.searchParams.set("download", "1");
    fileUrl.searchParams.set("file", this.data.fileUrl);

    const viewerUrl = new URL(this.data.baseUrl);
    viewerUrl.searchParams.set("url", fileUrl.toString());

    this.originalUrl = viewerUrl.toString();
    this.setIframe();
  }

  setIframe() {
    const iframeUrl = new URL(this.originalUrl);
    iframeUrl.searchParams.set("t", Date.now().toString());

    this.trustedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      iframeUrl.toString(),
    );
  }

  openInNewTab(): void {
    window.open(this.originalUrl, "_blank", "noopener,noreferrer");
  }

  onIframeLoad(): void {
    this.loading = false;
  }
}
