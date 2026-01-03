import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { WelcomeService } from './welcome.service';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';

@Component({
    selector: 'app-welcome:not(p)',
    standalone: true,
    imports: [MatCardModule, MatMenuModule, MatButtonModule, RouterLink],
    templateUrl: './welcome.component.html',
    styleUrl: './welcome.component.scss',
    providers: [DatePipe]
})
export class WelcomeComponent {

    currentDate: any;

    // isToggled
    isToggled = false;

    constructor(
        private datePipe: DatePipe,
        public themeService: CustomizerSettingsService,
        private welcomeService: WelcomeService
    ) {
        this.currentDate = this.datePipe.transform(new Date(), 'MMMM d, yyyy');
        this.themeService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
    }

    ngOnInit(): void {
        this.welcomeService.loadChart();
    }

}