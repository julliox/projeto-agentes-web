import { Component, OnInit } from '@angular/core';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { ToggleService } from './toggle.service';
import { NgClass, NgIf } from '@angular/common';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { AuthenticationService } from "../../services/auth.service";
import { AuthorizationService } from '../../services/authorization.service';


@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [NgScrollbarModule, MatExpansionModule, RouterLinkActive, RouterModule, RouterLink, NgClass, NgIf],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {

    // isSidebarToggled
    isSidebarToggled = false;

    // isToggled
    isToggled = false;

    // Informações do usuário
    currentUserName: string | null = null;
    currentUserProfile: any = null;

    constructor(
        private toggleService: ToggleService,
        public themeService: CustomizerSettingsService,
        public authService: AuthenticationService,
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

    logout() {
        this.authService.logout();
    }

    // Mat Expansion
    panelOpenState = false;
}
