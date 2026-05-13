/**
 * Shared Kernel — TimestampRange Value Object
 *
 * Pertenece a: shared/domain/value-objects
 * Por qué aquí: múltiples contextos necesitan representar periodos de tiempo
 * (período de monitoreo, duración de un incidente, vigencia de una meta).
 * Centralizar esta lógica evita que cada contexto reescriba cálculos de fechas.
 */
import { ValueObject } from '../base/value-object.base';

interface TimestampRangeProps {
  start: Date;
  end: Date;
}

export class TimestampRange extends ValueObject<TimestampRangeProps> {
  private constructor(props: TimestampRangeProps) {
    super(props);
  }

  static of(start: Date, end: Date): TimestampRange {
    if (start > end) throw new Error('La fecha de inicio debe ser anterior a la de fin');
    return new TimestampRange({ start, end });
  }

  static currentMonth(): TimestampRange {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return new TimestampRange({ start, end });
  }

  static lastDays(days: number): TimestampRange {
    const end = new Date();
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return new TimestampRange({ start, end });
  }

  get start(): Date { return new Date(this.props.start); }
  get end(): Date { return new Date(this.props.end); }

  get durationDays(): number {
    return Math.ceil(
      (this.props.end.getTime() - this.props.start.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  get durationHours(): number {
    return (this.props.end.getTime() - this.props.start.getTime()) / (1000 * 60 * 60);
  }

  remainingDays(): number {
    const now = new Date();
    if (now > this.props.end) return 0;
    return Math.ceil((this.props.end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  contains(date: Date): boolean {
    return date >= this.props.start && date <= this.props.end;
  }

  isActive(): boolean {
    const now = new Date();
    return now >= this.props.start && now <= this.props.end;
  }

  isExpired(): boolean {
    return new Date() > this.props.end;
  }
}
