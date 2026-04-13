import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { VerificationStatus } from '../../../../models/restaurants.types';

@Component({
  selector: 'app-verification-actions',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './verification-actions.component.html',
  styleUrls: ['./verification-actions.component.css'],
})
export class VerificationActionsComponent {
  readonly restaurantId = input.required<string>();
  readonly verificationStatus = input<VerificationStatus>(VerificationStatus.PENDING);
  readonly verifyAction = output<{ action: 'approve' | 'reject' | 'request-info', data?: any }>();

  readonly VerificationStatus = VerificationStatus;

  onApprove(): void {
    this.verifyAction.emit({ action: 'approve' });
  }

  onReject(): void {
    this.verifyAction.emit({ action: 'reject', data: { reason: 'Restaurant does not meet requirements' } });
  }

  onRequestInfo(): void {
    this.verifyAction.emit({ action: 'request-info', data: { message: 'Please provide additional documentation' } });
  }

  get showActions(): boolean {
    return this.verificationStatus() === VerificationStatus.PENDING;
  }
}
