import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
  expanded: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  isVegetarian?: boolean;
  isVegan?: boolean;
}

@Component({
  selector: 'app-menu-tab',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
  ],
  templateUrl: './menu-tab.component.html',
  styleUrls: ['./menu-tab.component.css'],
})
export class MenuTabComponent {
  readonly restaurantId = input.required<string>();

  readonly categories = signal<MenuCategory[]>([
    {
      id: '1',
      name: 'Appetizers',
      expanded: true,
      items: [
        { id: '1-1', name: 'Bruschetta', description: 'Toasted bread with tomatoes and basil', price: 12.99, isVegetarian: true },
        { id: '1-2', name: 'Calamari', description: 'Fried calamari with marinara sauce', price: 15.99 },
      ],
    },
    {
      id: '2',
      name: 'Main Courses',
      expanded: false,
      items: [
        { id: '2-1', name: 'Grilled Steak', description: '300g ribeye with vegetables', price: 35.99 },
        { id: '2-2', name: 'Salmon', description: 'Grilled salmon with lemon butter', price: 28.99, isVegetarian: false },
      ],
    },
    {
      id: '3',
      name: 'Desserts',
      expanded: false,
      items: [
        { id: '3-1', name: 'Tiramisu', description: 'Classic Italian dessert', price: 10.99, isVegetarian: true },
        { id: '3-2', name: 'Panna Cotta', description: 'Vanilla cream with berry sauce', price: 9.99, isVegetarian: true },
      ],
    },
  ]);

  toggleCategory(categoryId: string): void {
    this.categories.update(categories =>
      categories.map(cat =>
        cat.id === categoryId
          ? { ...cat, expanded: !cat.expanded }
          : cat
      )
    );
  }
}
