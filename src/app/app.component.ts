import { AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, OnInit, viewChild } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { RouterModule } from "@angular/router";
import { Theme, ThemeService } from "ng-configcat-publicapi-ui";
import { debounceTime, Subject } from "rxjs";
import { TrelloService } from "./services/trello-service";

@Component({
  selector: "configcat-trello-root",
  templateUrl: "./app.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterModule],
})
export class AppComponent implements OnInit, AfterViewInit {
  private readonly themeService = inject(ThemeService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly trelloService = inject(TrelloService);
  readonly resizeReference = viewChild<ElementRef<HTMLElement>>("resizeReference");

  private latestResizeHeight: number | null = null;

  title = "configcat-trello-powerup";
  shouldResizeOnAfterAllClosed = false;

  ngOnInit(): void {
    this.dialog.afterOpened.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(result => {
      this.resize(result.id);
      this.observeDialogContentChanges(result);
    });
    // The afterAllClosed method will emit on subscribe if there are no open dialogs to begin with. To avoid a false resize we check the openDialogs.
    this.shouldResizeOnAfterAllClosed = !!this.dialog.openDialogs.length;
    this.dialog.afterAllClosed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.shouldResizeOnAfterAllClosed) {
        this.resize();
      } else {
        this.shouldResizeOnAfterAllClosed = true;
      }
    });

    const darkModeOn = window.matchMedia("(prefers-color-scheme: dark)").matches;

    // If dark mode is enabled then directly switch to the dark-theme
    if (darkModeOn) {
      this.themeService.setTheme(Theme.Dark);
    }

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
      const turnOn = e.matches;
      this.themeService.setTheme(turnOn ? Theme.Dark : Theme.Light);
    });
  }

  ngAfterViewInit(): void {
    this.observeResizeReferenceChanges();
  }

  // Watches the background page content (behind any open dialog) for changes, the same way
  // observeDialogContentChanges watches a dialog, so route content that loads asynchronously
  // is also picked up instead of only resizing once on navigation.
  private observeResizeReferenceChanges(): void {
    const element = this.resizeReference()?.nativeElement;
    if (!element) {
      return;
    }
    const changed$ = new Subject<void>();
    const resizeObserver = new ResizeObserver(() => {
      changed$.next();
    });
    resizeObserver.observe(element);
    const mutationObserver = new MutationObserver(() => {
      changed$.next();
    });
    mutationObserver.observe(element, { childList: true, subtree: true, characterData: true });
    changed$.pipe(debounceTime(50), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      // A dialog resize is already driven by observeDialogContentChanges, so skip while one is open.
      if (!this.dialog.openDialogs.length) {
        this.resize();
      }
    });
    this.destroyRef.onDestroy(() => {
      changed$.complete();
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    });
  }

  // The initial resize() call happens right after the dialog opens, before content that loads
  // asynchronously (e.g. a table's rows) has rendered, so watch the container for later changes too.
  // Changes are debounced so a burst of mutations/resizes (e.g. many rows loading at once) triggers a single resize.
  private observeDialogContentChanges(dialogRef: MatDialogRef<unknown>): void {
    const containerElement = dialogRef.componentRef?.location.nativeElement as HTMLElement | undefined;
    if (!containerElement) {
      return;
    }
    const changed$ = new Subject<void>();
    const resizeObserver = new ResizeObserver(() => {
      changed$.next();
    });
    resizeObserver.observe(containerElement);
    const mutationObserver = new MutationObserver(() => {
      changed$.next();
    });
    mutationObserver.observe(containerElement, { childList: true, subtree: true, characterData: true });
    changed$.pipe(debounceTime(50), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.resize(dialogRef.id));
    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      changed$.complete();
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    });
  }

  resize(dialogId?: string): void {
    setTimeout(() => {
      let height = this.resizeReference()?.nativeElement?.offsetHeight ?? 0;
      if (dialogId) {
        const dialogHeight = document.getElementById(dialogId)?.offsetHeight ?? 0;
        // the extra 130 px is hard coded. because of the dialog content dinamically changes the height.
        height = height < dialogHeight ? dialogHeight + 130 : height;
      }

      //check height. if not presented, 0 or it matches the latest resize height we should not call the resize
      if (height > 0 && height !== this.latestResizeHeight) {
        this.latestResizeHeight = height;
        void this.trelloService.sizeToHeight(height);
      }
    }, 300);
  }
}
