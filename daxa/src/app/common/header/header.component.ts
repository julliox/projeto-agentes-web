import { NgClass, NgIf } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { Component, HostListener, OnInit } from '@angular/core';
import { ToggleService } from '../sidebar/toggle.service';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { AuthenticationService } from "../../services/auth.service";
import { AuthorizationService } from '../../services/authorization.service';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [NgClass, NgIf, MatMenuModule, MatButtonModule, RouterLink, RouterLinkActive],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

    // isSidebarToggled
    isSidebarToggled = false;

    // isToggled
    isToggled = false;

    // Informações do usuário
    currentUserName: string | null = null;
    currentUserEmail: string | null = null;
    currentUserProfile: any = null;

    constructor(
        private toggleService: ToggleService,
        public themeService: CustomizerSettingsService,
        private authService: AuthenticationService,
        private authorizationService: AuthorizationService
    ) {
        this.toggleService.isSidebarToggled$.subscribe(isSidebarToggled => {
            this.isSidebarToggled = isSidebarToggled;
        });
        this.themeService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
    }

    ngOnInit(): void {
        this.loadUserInfo();
    }

    /**
     * Carrega informações do usuário atual
     */
    private loadUserInfo(): void {
        this.currentUserName = this.authorizationService.getCurrentUserName();
        this.currentUserEmail = this.authorizationService.getCurrentUserEmail();
        this.currentUserProfile = this.authorizationService.getCurrentUserProfile();
    }

    /**
     * Verifica se o usuário pode acessar uma rota específica
     */
    canAccessRoute(route: string): boolean {
        return this.authorizationService.canAccessRoute(route);
    }

    /**
     * Verifica se o usuário é administrador
     */
    isAdministrator(): boolean {
        return this.authorizationService.isAdministrator();
    }

    // Burger Menu Toggle
    toggle() {
        this.toggleService.toggle();
    }

    // Header Sticky
    isSticky: boolean = false;
    @HostListener('window:scroll', ['$event'])
    checkScroll() {
        const scrollPosition = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
        if (scrollPosition >= 50) {
            this.isSticky = true;
        } else {
            this.isSticky = false;
        }
    }

    // Dark Mode
    toggleTheme() {
        this.themeService.toggleTheme();
    }

    logout() {
        this.authService.logout();
    }
}
