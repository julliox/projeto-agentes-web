export class ExportacaoUtil {
    public  static PDF_TYPE = 'application/pdf';
    public  static XLS_TYPE = 'application/excel';
    public  static ZIP_TYPE = 'application/zip';
    public static PNG_TYPE = 'application/png';

    public static download(arquivo: any, tipo: string, nome: string) {
        const a = this.criaTagLink(arquivo, tipo);
        a.download = nome;
        this.clicaTagLink(a);
    }

    public static verArquivo(arquivo: any, tipo: string, nome: string) {
        const a = this.criaTagLink(arquivo, tipo);
        a.setAttribute('target', '_blank');
        a.style.display = 'none';
        this.clicaTagLink(a);
    }

    public static criaTagLink(arquivo: any, tipo: string){
        const file = new Blob([arquivo['body']], {type: tipo});
        const fileURL = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = fileURL;
        return a;
    }

    public static clicaTagLink(a: any){
        window.document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(a.href);
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
