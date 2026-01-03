import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WorkingScheduleComponent } from './working-schedule/working-schedule.component';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';

@Component({
    selector: 'app-calendar',
    standalone: true,
    imports: [RouterLink, WorkingScheduleComponent, MatButtonModule, MatMenuModule, MatCardModule, FullCalendarModule],
    templateUrl: './calendar.component.html',
    styleUrl: './calendar.component.scss'
})
export class CalendarComponent {

    // Calendar
    calendarOptions: CalendarOptions = {
        initialView: 'dayGridMonth',
        dayMaxEvents: true, // when too many events in a day, show the popover
        weekends: true,
        events: [
            {
                title: 'Meeting with Developers',
                date: '2024-07-02'
            },
            {
                title: 'Consultation with Employees',
                date: '2024-07-06'
            },
            {
                title: 'Call for payment Project NOK',
                date: '2024-07-18'
            },
            {
                title: 'Meeting with UI/UX Designers',
                date: '2024-07-22'
            },
            {
                title: 'Consultation with Doctor',
                date: '2024-07-26'
            },
            {
                title: 'Meeting with Developers',
                date: '2024-08-03'
            },
            {
                title: 'Consultation with Employees',
                date: '2024-09-07'
            },
            {
                title: 'Call for payment Project NOK',
                date: '2024-10-17'
            },
            {
                title: 'Meeting with UI/UX Designers',
                date: '2024-11-22'
            },
            {
                title: 'Consultation with Doctor',
                date: '2024-12-29'
            }
        ],
        plugins: [dayGridPlugin]
    };

    // isToggled
    isToggled = false;

    constructor(
        public themeService: CustomizerSettingsService
    ) {
        this.themeService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
    }

}