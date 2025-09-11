import { Component, DestroyRef, ElementRef, inject, OnInit, viewChild } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatDialog } from "@angular/material/dialog";
import { RouterModule } from "@angular/router";
import { Theme, ThemeService } from "ng-configcat-publicapi-ui";
// import { IFrame } from "trellopowerup/lib/powerup";
import { TrelloService } from "./services/trello-service";

@Component({
  selector: "configcat-trello-root",
  templateUrl: "./app.component.html",
  imports: [RouterModule],
})
export class AppComponent implements OnInit {
  private readonly themeService = inject(ThemeService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly trelloService = inject(TrelloService);
  readonly resizeReference = viewChild<ElementRef<HTMLElement>>("resizeReference");

  title = "configcat-trello-powerup";
  // trelloPowerUpIframe!: IFrame;

  ngOnInit(): void {
    // this.trelloPowerUpIframe = this.trelloService.iframe();

    this.dialog.afterOpened.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(result => {
      this.resize(result.id);
    });
    this.dialog.afterAllClosed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.resize();
    });

    const darkModeOn =
    window.matchMedia
    && window.matchMedia("(prefers-color-scheme: dark)").matches;

    // If dark mode is enabled then directly switch to the dark-theme
    if (darkModeOn) {
      this.themeService.setTheme(Theme.Dark);
    }

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        const turnOn = e.matches;
        this.themeService.setTheme(turnOn ? Theme.Dark : Theme.Light);
      });
  }

  resize(dialogId?: string): void {
    setTimeout(() => {
      const contentHeight = this.resizeReference()?.nativeElement?.offsetHeight;
      //check contentHeight. if not presented or 0 we should not call the resize
      if (contentHeight && contentHeight > 0) {
        let height = contentHeight < 700 ? contentHeight : 700;
        if (dialogId) {
          const dialogHeight = document.getElementById(dialogId)?.offsetHeight ?? 0;
          // the extra 130 px is hard coded. because of the dialog content dinamically changes the height.
          height = height < dialogHeight ? dialogHeight + 130 : height;
        }
        void this.trelloService.sizeToHeight(height);
      }

    }, 300);
  }

}

