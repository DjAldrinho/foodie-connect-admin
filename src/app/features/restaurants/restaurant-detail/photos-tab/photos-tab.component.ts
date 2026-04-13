import { Component, input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

import type { RestaurantPhoto } from '../../../../models/restaurants.types';

@Component({
  selector: 'app-photos-tab',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './photos-tab.component.html',
  styleUrls: ['./photos-tab.component.css'],
})
export class PhotosTabComponent {
  readonly restaurantId = input.required<string>();
  readonly dialog = inject(MatDialog);

  readonly photos = signal<RestaurantPhoto[]>([]);

  onAddPhoto(): void {
    // TODO: Implement photo upload dialog
  }

  openLightbox(photoIndex: number): void {
    // TODO: Implement lightbox gallery with keyboard navigation
  }

  deletePhoto(photoId: string): void {
    // TODO: Implement delete with confirmation dialog
  }
}
