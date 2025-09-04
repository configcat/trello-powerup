import { Component, inject, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Theme, ThemeService } from "ng-configcat-publicapi-ui";

@Component({
  selector: "configcat-trello-root",
  templateUrl: "./app.component.html",
  imports: [RouterModule],
})
export class AppComponent implements OnInit {
  private readonly themeService = inject(ThemeService);

  title = "configcat-trello-powerup";

  ngOnInit(): void {
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

}

