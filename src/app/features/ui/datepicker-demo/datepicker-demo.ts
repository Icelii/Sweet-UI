import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { addDays } from '@shared/components/datepicker/date-utils';
import { Datepicker, DatepickerValue } from '@shared/components/datepicker/datepicker';
import { TranslatePipe } from '@shared/pipes/translate-pipe';

@Component({
  selector: 'app-datepicker-demo',
  imports: [ReactiveFormsModule, JsonPipe, Datepicker, TranslatePipe],
  templateUrl: './datepicker-demo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerDemo {
  private readonly fb = inject(FormBuilder);

  protected readonly today = new Date();
  protected readonly in60Days = addDays(this.today, 60);
  protected readonly isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

  protected readonly form = this.fb.group({
    single: [null as DatepickerValue],
    range: [null as DatepickerValue],
    multiple: [[] as DatepickerValue],
    dateTime: [null as DatepickerValue],
    limited: [null as DatepickerValue],
    disabled: [{ value: this.today as DatepickerValue, disabled: true }],
    inline: [null as DatepickerValue],
  });

  protected readonly value = toSignal(this.form.valueChanges, { initialValue: this.form.value });
}