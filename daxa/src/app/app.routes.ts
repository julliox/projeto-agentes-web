import { Routes } from '@angular/router';
import { NotFoundComponent } from './common/not-found/not-found.component';

import { TermsConditionsComponent } from './settings/terms-conditions/terms-conditions.component';
import { PrivacyPolicyComponent } from './settings/privacy-policy/privacy-policy.component';
import { ConnectionsComponent } from './settings/connections/connections.component';
import { ChangePasswordComponent } from './settings/change-password/change-password.component';
import { AccountSettingsComponent } from './settings/account-settings/account-settings.component';
import { SettingsComponent } from './settings/settings.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { LogoutComponent } from './authentication/logout/logout.component';
import { ConfirmEmailComponent } from './authentication/confirm-email/confirm-email.component';
import { LockScreenComponent } from './authentication/lock-screen/lock-screen.component';
import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './authentication/forgot-password/forgot-password.component';
import { SignUpComponent } from './authentication/sign-up/sign-up.component';
import { SignInComponent } from './authentication/sign-in/sign-in.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { PProjectsComponent } from './pages/profile-page/p-projects/p-projects.component';
import { TeamsComponent } from './pages/profile-page/teams/teams.component';
import { UserProfileComponent } from './pages/profile-page/user-profile/user-profile.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { AddUserComponent } from './pages/users-page/add-user/add-user.component';
import { UsersListComponent } from './pages/users-page/users-list/users-list.component';
import { UsersPageComponent } from './pages/users-page/users-page.component';
import { HdAgentsComponent } from './pages/help-desk-page/hd-agents/hd-agents.component';

import { HelpDeskPageComponent } from './pages/help-desk-page/help-desk-page.component';


import { TeamMembersComponent } from './pages/users-page/team-members/team-members.component';
import {TurnoPageCreateComponent} from "./turno/turno-page-create/turno-page-create.component";
import {ViewTurnosComponent} from "./turno/view-turnos/view-turnos.component";
import {EditPageAgentComponent} from "./pages/help-desk-page/edit-page-agent/edit-page-agent.component";
import {AddPageAgentComponent} from "./pages/help-desk-page/add-page-agent/add-page-agent.component";
import {TurnoTabelaPageComponent} from "./pages/help-desk-page/turno-tabela-page/turno-tabela-page.component";
import {TipoTurnoComponent} from "./pages/help-desk-page/tipo-turno-page/tipo-turno/tipo-turno.component";
import {AgentProfileComponent} from "./pages/help-desk-page/agent-profile/agent-profile.component";
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { AgentPontoComponent } from './pages/agent-ponto/agent-ponto.component';
import { TeamsPageComponent } from './pages/teams-page/teams-page.component';
import { TurnosCalendarComponent } from './pages/turnos-calendar/turnos-calendar.component';

export const routes: Routes = [
    // Rotas públicas (sem autenticação)
    {path: 'authentication', component: AuthenticationComponent, children: [
        {path: '', component: SignInComponent},
        {path: 'sign-up', component: SignUpComponent},
        {path: 'forgot-password', component: ForgotPasswordComponent},
        {path: 'reset-password', component: ResetPasswordComponent},
        {path: 'lock-screen', component: LockScreenComponent},
        {path: 'confirm-email', component: ConfirmEmailComponent},
        {path: 'logout', component: LogoutComponent}
    ]},


    // Rotas protegidas (com autorização baseada em perfil)
    {path: '', component: TurnoTabelaPageComponent, canActivate: [RoleGuard]},
    {path: 'ponto', component: AgentPontoComponent, canActivate: [RoleGuard]},

    {
        path: 'help-desk-page',
        component: HelpDeskPageComponent,
        canActivate: [RoleGuard],
        children: [
            {path: '', component: HdAgentsComponent},
            {path: 'agents', component: HdAgentsComponent},
            {path: 'add-agent', component: AddPageAgentComponent},
            {path: 'edit-agent', component: EditPageAgentComponent},
            {path: 'edit-agent/:id', component: EditPageAgentComponent},
            {path: 'turno-tabela', component: TurnoTabelaPageComponent},
            {path: 'turno-tabela/:agentId', component: TurnoTabelaPageComponent},
            {path: 'tipo-turno', component: TipoTurnoComponent},
            {path: 'agent-profile', component: AgentProfileComponent},
            {path: 'agent-profile/:id', component: AgentProfileComponent}
        ]
    },

    // Rotas para turnos
    {path: 'view-turnos/:id', component: ViewTurnosComponent, canActivate: [RoleGuard]},

    {
        path: 'users',
        component: UsersPageComponent,
        canActivate: [RoleGuard],
        children: [
            {path: '', component: TeamMembersComponent},
            {path: 'users-list', component: UsersListComponent},
            {path: 'add-user', component: AddUserComponent},
        ]
    },
    {
        path: 'profile',
        component: ProfilePageComponent,
        canActivate: [RoleGuard],
        children: [
            {path: '', component: UserProfileComponent},
            {path: 'teams', component: TeamsComponent},
            {path: 'projects', component: PProjectsComponent},
        ]
    },
    {path: 'my-profile', component: MyProfileComponent, canActivate: [RoleGuard]},
    {
        path: 'settings',
        component: SettingsComponent,
        canActivate: [RoleGuard],
        children: [
            {path: '', component: AccountSettingsComponent},
            {path: 'change-password', component: ChangePasswordComponent},
            {path: 'connections', component: ConnectionsComponent},
            {path: 'privacy-policy', component: PrivacyPolicyComponent},
            {path: 'terms-conditions', component: TermsConditionsComponent}
        ]
    },
    {path: 'turno/create', component: TurnoPageCreateComponent, canActivate: [RoleGuard]},
    {path: 'turnos-calendar', component: TurnosCalendarComponent, canActivate: [RoleGuard]},
    {path: 'teams', component: TeamsPageComponent, canActivate: [RoleGuard]},
    {path: '**', component: NotFoundComponent}
];
