import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class AgentProfileModule {

}
export interface AgentProfile {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    desInfo: string;
    admissionDate: string; // Formato: 'AAAA-MM-DD'
    salarioBase: number; // Utilizamos 'number' para facilitar a exibição; pode ser 'BigDecimal' se preferir
    status: 'ACTIVE' | 'INACTIVE';
}
