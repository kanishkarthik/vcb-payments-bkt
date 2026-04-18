import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@vcb/shared-libs';
import { PaymentStepperService, PaymentStep2DataBKT, PaymentMethodType } from '@vcb/shared-libs';
import { Router } from '@angular/router';

/**
 * Step 2 Component for Bank Transfer (BKT) Payment Method
 * This component is exposed from vcb-payments-bkt remote module
 * Implements BKT-specific payment details form
 */
@Component({
  selector: 'app-payment-step2-bkt',
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './payment-step2-bkt.component.html',
  styleUrl: './payment-step2-bkt.component.scss'
})
export class PaymentStep2BKTComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private paymentStepperService = inject(PaymentStepperService);
  private router = inject(Router);

  form!: FormGroup;
  isLoading = false;

  // Mock bank list
  banks = [
    { code: 'VCBB', name: 'VCB Bank' },
    { code: 'ACB', name: 'ACB Bank' },
    { code: 'BID', name: 'BID Bank' },
    { code: 'SAC', name: 'SAC Bank' }
  ];

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    const state = this.paymentStepperService.getPaymentState();
    const step2 = state.step2 as PaymentStep2DataBKT | undefined;

    this.form = this.formBuilder.group({
      beneficiaryBankCode: [step2?.beneficiaryBankCode || '', Validators.required],
      beneficiaryAccountNumber: [step2?.beneficiaryAccountNumber || '', Validators.required],
      beneficiaryName: [step2?.beneficiaryName || '', Validators.required],
      amount: [step2?.amount || '', [Validators.required, Validators.min(0.01)]],
      narration: [step2?.narration || '']
    });
  }

  onBankSelected(bankCode: string): void {
    const bank = this.banks.find(b => b.code === bankCode);
    if (bank) {
      const currentStep2 = this.paymentStepperService.getPaymentState().step2 as any;
      const updatedStep2: PaymentStep2DataBKT = {
        ...currentStep2,
        beneficiaryBankCode: bank.code,
        beneficiaryBankName: bank.name
      };
      this.paymentStepperService.updateStep2(updatedStep2);
    }
  }

  onNext(): void {
    if (this.form.valid) {
      const step2Data: PaymentStep2DataBKT = {
        beneficiaryBankCode: this.form.get('beneficiaryBankCode')?.value,
        beneficiaryAccountNumber: this.form.get('beneficiaryAccountNumber')?.value,
        beneficiaryName: this.form.get('beneficiaryName')?.value,
        beneficiaryBankName: this.getBankName(this.form.get('beneficiaryBankCode')?.value),
        amount: parseFloat(this.form.get('amount')?.value),
        narration: this.form.get('narration')?.value
      };

      this.paymentStepperService.updateStep2(step2Data);
      this.paymentStepperService.goToNextStep();
    }
  }

  onBack(): void {
    this.paymentStepperService.goToPreviousStep();
  }

  onCancel(): void {
    if (confirm('Are you sure you want to cancel this payment? Your progress will be lost.')) {
      this.paymentStepperService.resetStepper();
      this.router.navigate(['/payments']);
    }
  }

  private getBankName(code: string): string {
    return this.banks.find(b => b.code === code)?.name || code;
  }

  /**
   * Mock beneficiary lookup API call
   */
  lookupBeneficiary(): void {
    const accountNumber = this.form.get('beneficiaryAccountNumber')?.value;
    const bankCode = this.form.get('beneficiaryBankCode')?.value;

    if (!accountNumber || !bankCode) {
      return;
    }

    this.isLoading = true;
    // Mock API call - replace with real endpoint
    setTimeout(() => {
      this.form.patchValue({
        beneficiaryName: 'Mock Beneficiary Name'
      });
      this.isLoading = false;
    }, 800);
  }
}
