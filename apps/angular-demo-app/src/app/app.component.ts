import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { sortedStringify } from '@axhxrx/json';

@Component({
  standalone: true,
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  useSortedStringify() {
    const demoObject = {
      radiation: false,
      fire: true,
      ice: false,
      wind: false,
      powers: ['fire', 'ice', 'wind', 'radiation'],
    };

    const before = JSON.stringify(demoObject, null, 2);
    const after = sortedStringify(demoObject, 2);

    return`BEFORE:\n${before}\n\nAFTER:\n${after}`;
  }
}
