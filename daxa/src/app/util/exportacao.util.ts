export class ExportacaoUtil {
    public  static PDF_TYPE = 'application/pdf';
    public  static XLS_TYPE = 'application/excel';
    public  static ZIP_TYPE = 'application/zip';
    public static PNG_TYPE = 'application/png';

    public static verArquivo(arquivo: any, tipo: string, nome: string) {
        const a = this.criaTagLink(arquivo, tipo);
        a.setAttribute('target', '_blank');
        a.style.display = 'none';
        this.clicaTagLink(a);
    }

    public static criaTagLink(arquivo: any, tipo: string): HTMLAnchorElement {
        const blob = new Blob([arquivo], { type: tipo });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        return link;
    }

    public static download(arquivo: any, tipo: string, nome: string) {
        const a = this.criaTagLink(arquivo, tipo);
        a.download = nome;
        this.clicaTagLink(a);
    }

    public static clicaTagLink(a: HTMLAnchorElement){
        window.document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(a.href);
        window.document.body.removeChild(a);
    }

    public static redirecionarUrlExterna(url:string){
        const a = document.createElement("a");
        a.setAttribute('target', '_blank');
        a.href = url;
        this.clicaTagLink(a);
    }

    public static downloadFromBase64(arquivo: any, extensao: string, nome: string): void {
        const linkSource = `data:${extensao};base64,${arquivo}`;
        const downloadLink = document.createElement("a");
        const fileName = nome;

        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
    }

}
