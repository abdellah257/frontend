import { Injectable, Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "secondsTimeDuration",
  standalone: false,
})
@Injectable()
export class TimeDurationPipe implements PipeTransform {
  transform(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const leftMinutes = minutes % 60;
    const leftSeconds = seconds % 60;

    if (hours === 0) {
      if (leftMinutes === 0) return `${leftSeconds}sec`;
      return `${leftMinutes}min ${leftSeconds}min`;
    }
    return `${hours}h ${leftMinutes}min ${leftSeconds}min`;
  }
}
